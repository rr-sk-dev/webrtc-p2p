import "./style.css";

import { APP_ID } from "../configs/agora-io.config";

import AgoraRTM, { RtmChannel, RtmClient, RtmMessage } from "agora-rtm-sdk";

/** Agora.io Configs **/
const uid = Math.floor(Math.random() * 10000).toString(); // userId
const token: any = null;

const client: RtmClient = AgoraRTM.createInstance(APP_ID);
let channel: RtmChannel;

/** URL Configs **/
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const roomId = urlParams.get("room");

if (!roomId) {
  window.location.href = "lobby.html";
}

/** Media Streams **/
let localStream: MediaStream;
let remoteStream: MediaStream;

/** RTC Peer Connection **/
let peerConnection: RTCPeerConnection;

/** STUN Server **/
const servers: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

const pc_constraints: MediaStreamConstraints = {
  audio: true, // ! Change this when deploying
  video: {
    deviceId: {
      exact: "b3f59f74cb234ebd75ee0b4d6d47247d766a2759cea709bb09aa59d3023417f4",
    },
    width: { min: 640, ideal: 1920, max: 1920 },
    height: { min: 480, ideal: 1080, max: 1080 },
  },
};

const constraints: MediaStreamConstraints = {
  audio: true, // ! Change this when deploying
  video: {
    width: { min: 640, ideal: 1920, max: 1920 },
    height: { min: 480, ideal: 1080, max: 1080 },
  },
};

const start = async () => {
  await setupClientChannel(roomId as string);

  // Ask for user permissions
  await createLocalStream("user-1");
};

const setupClientChannel = async (channelName: string) => {
  await client.login({ uid, token });

  // index.html?room=1234
  channel = client.createChannel(channelName);
  await channel.join();

  // Event listener - When a new member joins the channel
  channel.on("MemberJoined", handleUserJoined);

  // Event listener - When a member leaves the channel
  channel.on("MemberLeft", handleUserLeft);

  // Event listener - When a peer sends a message
  client.on("MessageFromPeer", handleMessageFromPeer);
};

const createLocalStream = async (elementID: "user-1" | "user-2") => {
  const devices = await navigator.mediaDevices.enumerateDevices();

  if (
    devices.find(
      (device) =>
        device.deviceId ===
        "b3f59f74cb234ebd75ee0b4d6d47247d766a2759cea709bb09aa59d3023417f4"
    )
  ) {
    // Ask for user permissions - PC
    localStream = await navigator.mediaDevices.getUserMedia(pc_constraints);
  } else {
    // Ask for user permissions - OTHERS
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
  }

  const localVideo = document.getElementById(elementID) as HTMLVideoElement;
  localVideo.muted = true; // ! Change this when deploying
  localVideo.srcObject = localStream;
};

const createRemoteStream = (elementID: "user-1" | "user-2") => {
  const remoteVideo = document.getElementById(elementID) as HTMLVideoElement;
  remoteVideo.srcObject = remoteStream;
  remoteVideo.style.display = "block";
};

const handleMessageFromPeer = async (
  message: RtmMessage | any,
  memberId: string
) => {
  message = JSON.parse(message.text as string);
  console.log("%c[INFO] Message", "color: lightblue", message, memberId);

  if (message.type === "offer") {
    createAnswer(memberId, message.offer);
  }

  if (message.type === "answer") {
    addAnswer(message.answer);
  }

  if (message.type === "candidate") {
    if (peerConnection) {
      peerConnection.addIceCandidate(message.candidate);
    }
  }
};

const handleUserLeft = (memberId: string) => {
  const remoteVideo = document.getElementById("user-1") as HTMLVideoElement;
  remoteVideo.style.display = "none";

  const localVideo = document.getElementById("user-1") as HTMLVideoElement;
  localVideo.classList.remove("smallFrame");
};

const handleUserJoined = async (memberId: string) => {
  console.log(
    "%c[INFO] A new user joined the channel",
    "color: lightblue",
    memberId
  );

  createOffer(memberId);
};

const createPeerConnection = async (memberId: string) => {
  peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();
  createRemoteStream("user-2");

  const localVideo = document.getElementById("user-1") as HTMLVideoElement;
  localVideo.classList.add("smallFrame");

  if (!localStream) {
    await createLocalStream("user-1");
  }

  // Add local tracks to peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // Listen for remote peer tracks and add them to the remote stream
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  // Generate ICE Candidates
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      client.sendMessageToPeer(
        {
          text: JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
          }),
        },
        memberId
      );
    }
  };
};

const createOffer = async (memberId: string) => {
  await createPeerConnection(memberId);

  // Create an offer
  const offer = await peerConnection.createOffer();

  // Set local description
  await peerConnection.setLocalDescription(offer);

  client.sendMessageToPeer(
    { text: JSON.stringify({ type: "offer", offer }) },
    memberId
  );
};

const createAnswer = async (
  memberId: string,
  offer: RTCSessionDescriptionInit
) => {
  await createPeerConnection(memberId);

  // Set remote description
  await peerConnection.setRemoteDescription(offer);

  // Create an answer
  const answer = await peerConnection.createAnswer();

  // Set local description
  await peerConnection.setLocalDescription(answer);

  client.sendMessageToPeer(
    { text: JSON.stringify({ type: "answer", answer }) },
    memberId
  );
};

const addAnswer = async (answer: RTCSessionDescriptionInit) => {
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
};

const leaveChannel = async () => {
  await channel.leave();

  await client.logout();
};

const toggleCamera = async () => {
  const videoTrack = localStream
    .getTracks()
    .find((track) => track.kind === "video") as MediaStreamTrack;

  if (videoTrack.enabled) {
    videoTrack.enabled = false;
    const cameraBtn = document.getElementById("camera-btn") as HTMLVideoElement;
    cameraBtn.style.backgroundColor = "rgb(255, 80, 80)";
  } else {
    videoTrack.enabled = true;
    const cameraBtn = document.getElementById("camera-btn") as HTMLVideoElement;
    cameraBtn.style.backgroundColor = "rgb(179, 102, 249)";
  }
};

const toggleMic = async () => {
  const audioTrack = localStream
    .getTracks()
    .find((track) => track.kind === "audio") as MediaStreamTrack;

  if (audioTrack.enabled) {
    audioTrack.enabled = false;
    const micBtn = document.getElementById("mic-btn") as HTMLVideoElement;
    micBtn.style.backgroundColor = "rgb(255, 80, 80)";
  } else {
    audioTrack.enabled = true;
    const micBtn = document.getElementById("mic-btn") as HTMLVideoElement;
    micBtn.style.backgroundColor = "rgb(179, 102, 249)";
  }
};

window.addEventListener("beforeunload", leaveChannel);

const cameraBtn = document.getElementById("camera-btn") as HTMLVideoElement;
cameraBtn.addEventListener("click", toggleCamera);

const micBtn = document.getElementById("mic-btn") as HTMLVideoElement;
micBtn.addEventListener("click", toggleMic);

start();
