/**
* @returns Promise<{isCameraConnected: true, isMicrophoneConnected: true}>
*/
export default async function checkDevices() {
  const status = { isMicrophoneConnected: false, isCameraConnected: false };
  const enumerator = await navigator.mediaDevices.enumerateDevices();

  enumerator.forEach(input => {
    if (input.kind === "audioinput") {
      status.isMicrophoneConnected = input.deviceId !== null && input.label !== null
    }

    if (input.kind === "videoinput") {
      status.isCameraConnected = input.deviceId !== null && input.label !== null
    }
  });

  return status;
}