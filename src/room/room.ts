import "./room.css";

import { RtmMessage } from "agora-rtm-sdk";
import { getChannel, getClient } from "../utils/agora-rtm.utils";
import { getLocalMediaStream } from "../utils/device.utils";
import { getElementById } from "../utils/view.utils";

let roomId: string;

const setupLocalMediaStream = async () => {
  const localMediaStream = await getLocalMediaStream();
  const localVideo = getElementById<HTMLVideoElement>("user-1");
  localVideo.muted = true; // ! Change this when deploying
  localVideo.srcObject = localMediaStream;
};

// TODO
const onUserJoined = (memberId: string) => {
  console.log(
    "%c[INFO] onUserJoined",
    "background-color: blue; color: black",
    memberId
  );
};

// TODO
const onUserLeft = (memberId: string) => {
  console.log(
    "%c[INFO] onUserLeft",
    "background-color: lightblue; color: black",
    memberId
  );
};

// TODO
const onPeerMessage = (
  message: RtmMessage,
  memberId: string,
  messageProps: any
) => {
  console.group("%c[INFO] onPeerMessage");
  console.log(
    "%c[INFO] memberId",
    "background-color: lightblue; color: black",
    memberId
  );
  console.log(
    "%c[INFO] message",
    "background-color: lightblue; color: black",
    message
  );
  console.log(
    "%c[INFO] messageProps",
    "background-color: lightblue; color: black",
    messageProps
  );
  console.groupEnd();
};

/** Check if this page is being accessed incorrectly. **/
const validateRoomRoute = () => {
  const urlParams = new URLSearchParams(window.location.search);
  roomId = urlParams.get("room") as string;

  if (!roomId) {
    window.location.href = "../../index.html";
  }
};

/** Bootstrap Function **/
const run = async () => {
  // 1. Validate room route
  validateRoomRoute();

  // 2. Setup RTM client
  const client = getClient();

  const userId = Math.floor(Math.random() * 10000).toString();

  await client.login({ uid: userId });

  // 2. Setup RTM Channel
  const channel = await getChannel(roomId);
  await channel.join();

  // 2.1. Listen for new members joining the channel
  channel.on("MemberJoined", onUserJoined);

  // 2.2. Listen for members leaving the channel
  channel.on("MemberLeft", onUserLeft);

  // 2.3. Listen for peer messages
  client.on("MessageFromPeer", onPeerMessage);

  // 3. Setup Local Stream
  await setupLocalMediaStream();
};

const leaveChannel = async () => {
  const channel = await getChannel(roomId);
  await channel.leave();

  getClient().logout();
};

const toggleCamera = async () => {
  const localMediaStream = await getLocalMediaStream();

  const videoTrack = localMediaStream
    .getTracks()
    .find((track) => track.kind === "video") as MediaStreamTrack;

  if (videoTrack.enabled) {
    videoTrack.enabled = false;
    const cameraBtn = getElementById<HTMLVideoElement>("camera-btn");
    cameraBtn.style.backgroundColor = "rgb(255, 80, 80)";
  } else {
    videoTrack.enabled = true;
    const cameraBtn = getElementById<HTMLVideoElement>("camera-btn");
    cameraBtn.style.backgroundColor = "rgb(179, 102, 249)";
  }
};

const toggleMic = async () => {
  const localMediaStream = await getLocalMediaStream();
  const audioTrack = localMediaStream
    .getTracks()
    .find((track) => track.kind === "audio") as MediaStreamTrack;

  if (audioTrack.enabled) {
    audioTrack.enabled = false;
    const micBtn = getElementById<HTMLVideoElement>("mic-btn");
    micBtn.style.backgroundColor = "rgb(255, 80, 80)";
  } else {
    audioTrack.enabled = true;
    const micBtn = getElementById<HTMLVideoElement>("mic-btn");
    micBtn.style.backgroundColor = "rgb(179, 102, 249)";
  }
};

window.addEventListener("beforeunload", leaveChannel);

const cameraBtn = getElementById<HTMLVideoElement>("camera-btn");
cameraBtn.addEventListener("click", toggleCamera);

const micBtn = getElementById<HTMLVideoElement>("mic-btn");
micBtn.addEventListener("click", toggleMic);

/** Start running the room **/
run();

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

// const createRemoteStream = (elementID: "user-1" | "user-2") => {
//   const remoteVideo = getElementById<HTMLVideoElement>(elementID);
//   remoteVideo.srcObject = remoteStream;
//   remoteVideo.style.display = "block";
// };

// const handleMessageFromPeer = async (
//   message: RtmMessage | any,
//   memberId: string
// ) => {
//   message = JSON.parse(message.text as string);
//   console.log("%c[INFO] Message", "color: lightblue", message, memberId);

//   if (message.type === "offer") {
//     createAnswer(memberId, message.offer);
//   }

//   if (message.type === "answer") {
//     addAnswer(message.answer);
//   }

//   if (message.type === "candidate") {
//     if (peerConnection) {
//       peerConnection.addIceCandidate(message.candidate);
//     }
//   }
// };

// const handleUserLeft = (memberId: string) => {
//   const remoteVideo = getElementById<HTMLVideoElement>("user-1");
//   remoteVideo.style.display = "none";

//   const localVideo = getElementById<HTMLVideoElement>("user-1");
//   localVideo.classList.remove("smallFrame");
// };

// const handleUserJoined = async (memberId: string) => {
//   console.log(
//     "%c[INFO] A new user joined the channel",
//     "color: lightblue",
//     memberId
//   );

//   createOffer(memberId);
// };

// const createPeerConnection = async (memberId: string) => {
//   peerConnection = new RTCPeerConnection(servers);

//   remoteStream = new MediaStream();
//   createRemoteStream("user-2");

//   const localVideo = getElementById<HTMLVideoElement>("user-1");
//   localVideo.classList.add("smallFrame");

//   if (!localStream) {
//     await createLocalStream("user-1");
//   }

//   // Add local tracks to peer connection
//   localStream.getTracks().forEach((track) => {
//     peerConnection.addTrack(track, localStream);
//   });

//   // Listen for remote peer tracks and add them to the remote stream
//   peerConnection.ontrack = (event) => {
//     event.streams[0].getTracks().forEach((track) => {
//       remoteStream.addTrack(track);
//     });
//   };

//   // Generate ICE Candidates
//   peerConnection.onicecandidate = async (event) => {
//     if (event.candidate) {
//       client.sendMessageToPeer(
//         {
//           text: JSON.stringify({
//             type: "candidate",
//             candidate: event.candidate,
//           }),
//         },
//         memberId
//       );
//     }
//   };
// };

// const createOffer = async (memberId: string) => {
//   await createPeerConnection(memberId);

//   // Create an offer
//   const offer = await peerConnection.createOffer();

//   // Set local description
//   await peerConnection.setLocalDescription(offer);

//   client.sendMessageToPeer(
//     { text: JSON.stringify({ type: "offer", offer }) },
//     memberId
//   );
// };

// const createAnswer = async (
//   memberId: string,
//   offer: RTCSessionDescriptionInit
// ) => {
//   await createPeerConnection(memberId);

//   // Set remote description
//   await peerConnection.setRemoteDescription(offer);

//   // Create an answer
//   const answer = await peerConnection.createAnswer();

//   // Set local description
//   await peerConnection.setLocalDescription(answer);

//   client.sendMessageToPeer(
//     { text: JSON.stringify({ type: "answer", answer }) },
//     memberId
//   );
// };

// const addAnswer = async (answer: RTCSessionDescriptionInit) => {
//   if (!peerConnection.currentRemoteDescription) {
//     peerConnection.setRemoteDescription(answer);
//   }
// };

// const leaveChannel = async () => {
//   await channel.leave();

//   await client.logout();
// };

// const toggleCamera = async () => {
//   const videoTrack = localStream
//     .getTracks()
//     .find((track) => track.kind === "video") as MediaStreamTrack;

//   if (videoTrack.enabled) {
//     videoTrack.enabled = false;
//     const cameraBtn = getElementById<HTMLVideoElement>("camera-btn");
//     cameraBtn.style.backgroundColor = "rgb(255, 80, 80)";
//   } else {
//     videoTrack.enabled = true;
//     const cameraBtn = getElementById<HTMLVideoElement>("camera-btn");
//     cameraBtn.style.backgroundColor = "rgb(179, 102, 249)";
//   }
// };

// const toggleMic = async () => {
//   const audioTrack = localStream
//     .getTracks()
//     .find((track) => track.kind === "audio") as MediaStreamTrack;

//   if (audioTrack.enabled) {
//     audioTrack.enabled = false;
//     const micBtn = getElementById<HTMLVideoElement>("mic-btn");
//     micBtn.style.backgroundColor = "rgb(255, 80, 80)";
//   } else {
//     audioTrack.enabled = true;
//     const micBtn = getElementById<HTMLVideoElement>("mic-btn");
//     micBtn.style.backgroundColor = "rgb(179, 102, 249)";
//   }
// };

// window.addEventListener("beforeunload", leaveChannel);

// const cameraBtn = getElementById<HTMLVideoElement>("camera-btn");
// cameraBtn.addEventListener("click", toggleCamera);

// const micBtn = getElementById<HTMLVideoElement>("mic-btn");
// micBtn.addEventListener("click", toggleMic);

// start();
