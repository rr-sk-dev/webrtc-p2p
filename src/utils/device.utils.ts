/** Constraints to be applied when asking for device's permissions **/
const constraints: MediaStreamConstraints = {
  audio: false, // ! Change this when deploying
  video: {
    width: { min: 300, ideal: 1920, max: 1920 },
    height: { min: 300, ideal: 1080, max: 1080 },
  },
};

/** Local Media Stream **/
let localMediaStream: MediaStream;

/** Returns the local media stream with the required constraints **/
export const getLocalMediaStream = async () => {
  if (!localMediaStream) {
    localMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
  }

  return localMediaStream;
};

/** Returns a list of devices that have been given permission **/
export const getDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();

  return devices.filter((device) => device.label === "");
};
