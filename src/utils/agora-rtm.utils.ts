import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";
import { APP_ID } from "../../configs/agora-io.config";

let client: RtmClient;
let channel: RtmChannel;

/** Creates an AgoraRTM instance. **/
const createClientInstance = async () => {
  client = AgoraRTM.createInstance(APP_ID);
};

const createChannel = async (name: string) => {
  channel = client.createChannel(name);
};

export const getClient = () => {
  if (!client) {
    createClientInstance();
  }

  return client;
};

export const getChannel = async (name: string) => {
  if (!channel) {
    await createChannel(name);
  }

  return channel;
};
