# @chime/devices

This packgage contains a React context provider and a hook around AWS Chime for capturing system audio and video devices.

## Install

This pacakge has a peer dependency on `amazon-chime-sdk-js`.

You can install the package using npm like this.

```sh
$ npm i @chime/devices amazon-chime-sdk-js
```

or with Yarn.

```sh
$ yarn add @chime/devices amazon-chime-sdk-js
```

## Use in your code

Wrap yout `<App>` (or your components that will be using devices) in a `<ChimeDevicesProvider>` as follows.

```jsx
<ChimeDevicesProvider>
  <App />
</ChimeDevicesProvider>
```

Then, in some child component, you can call `useChimeDevices`, which returns the following.

- `audioInputs` - A list of audio input devices (i.e. microphones). type = `{deviceId:string, label:string}[]`
- `audioOutputs` - A list of audio output devices (i.e. speakers).
- `videoInputs` - A list of video input devices (i.e. webcams).
- `currentAudioInputDeviceId` - The currently selected audio input `deviceId` or `null`.
- `currentAudioOutputDeviceId` - The currently selected audio output `deviceId` or `null`.
- `currentVideoInputDeviceId` - The currently selected video input `deviceId` or `null`.
- `deviceController` - The AWS Chime SDK `DeviceController`.
- `setAudioInput` - A function to set the current audio input. Pass the `deviceId` of the new audio input.
- `setAudioOutput` - A function to set the current audio output. Pass the `deviceId` of the new audio output.
- `setVideoInput` - A function to set the current video input. Pass the `deviceId` of the new video input.

For example:

```jsx
const AudioInputDevices = () => {
  const {
    audioInputs,
    currentAudioInputDeviceId,
    setAudioInput,
  } = useChimeDevices();

  return (
    <ul>
      {audioInputs.map(({ deviceId, label }) => (
        <li key={deviceId} onClick={() => setAudioInput(deviceId)}>
          {label}
          {deviceId === currentAudioInputDeviceId && '[selected]'}
        </li>
      ))}
    </ul>
  );
};
```

You can see an example running live on
[CodeSandbox](https://codesandbox.io/s/mystifying-noether-2qwrp)

## License

For use under the MIT [License](./LICENSE)
