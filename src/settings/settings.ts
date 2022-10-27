import { getDevices } from "../utils/device.utils";
import { getElementById, getElementsByTagName } from "../utils/view.utils";
import "./settings.css";

const audioSelect = getElementById<HTMLSelectElement>("audioSelect");
const videoSelect = getElementById<HTMLSelectElement>("videoSelect");
const audioSettings = getElementById<HTMLDivElement>("audioSettings");
const videoSettings = getElementById<HTMLDivElement>("videoSettings");

audioSelect.addEventListener("change", (ev: any) => {
  const selectedAudioInput = ev.target.value;
  console.log(selectedAudioInput);
});

videoSelect.addEventListener("change", (ev: any) => {
  const selectedVideoInput = ev.target.value;
  console.log(selectedVideoInput);
});

const loadSettings = async (): Promise<void> => {
  const devices = await getDevices();

  if (!devices.length) {
    alert("no permissions were given");
    return Promise.reject("no permissions were given");
  }

  console.log("%c[INFO] Available Devices", "background-color: blue");

  // Show settings content
  getElementsByTagName<HTMLElement>("main").style.display = "block";

  devices.forEach((device) => {
    // Create option element and add id to the select
    const option = document.createElement("option");
    option.text = device.label;

    addDeviceOption(device, option);
  });
};

const addDeviceOption = (
  device: MediaDeviceInfo,
  option: HTMLOptionElement
): void => {
  if (device.kind === "audioinput" || device.kind === "audiooutput") {
    audioSelect.options.add(option);

    audioSettings.style.display = "block";
  } else {
    videoSelect.options.add(option);

    videoSettings.style.display = "block";
  }
};

loadSettings();
