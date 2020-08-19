import { useEffect, useState, useMemo } from 'react';
import {
  DefaultDeviceController,
  ConsoleLogger,
  LogLevel,
} from 'amazon-chime-sdk-js';

const logger = new ConsoleLogger('MyLogger', LogLevel.ERROR);
const defaultDeviceController = new DefaultDeviceController(logger);

type SanitizedMediaDeviceInfo = {
  deviceId: string;
  label: string;
};

type MediaDevices = {
  audioInputs: SanitizedMediaDeviceInfo[];
  audioOutputs: SanitizedMediaDeviceInfo[];
  videoInputs: SanitizedMediaDeviceInfo[];
  currentAudioInputDeviceId: string | null;
  currentAudioOutputDeviceId: string | null;
  currentVideoInputDeviceId: string | null;
};

export interface MediaDevicesResults extends MediaDevices {
  deviceController: DefaultDeviceController;
  setAudioInput: (id: string) => void;
  setAudioOutput: (id: string) => void;
  setVideoInput: (id: string) => void;
}

const kinds = {
  audioinput: 'Microphone',
  audiooutput: 'Speakers',
  videoinput: 'Camera',
};

// MacBook Air Speakers (E01D) => MacBook Air Speakers
const sanitize = (list: MediaDeviceInfo[]) =>
  list.map(({ deviceId, label, kind }) => {
    return {
      deviceId,
      label:
        deviceId === 'default'
          ? `System ${kinds[kind]}`
          : label.split('(')[0].trim(),
    };
  });

const mustBeInList = (
  deviceId: string | null,
  devices: SanitizedMediaDeviceInfo[]
) => {
  return devices.find(({ deviceId: id }) => deviceId === id) ? deviceId : null;
};

type useChimeDevicesProps = {
  deviceController?: DefaultDeviceController;
  initialAudioInputDeviceId?: string;
  initialAudioOutDeviceId?: string;
  initialVideoInputDeviceId?: string;
};

export const useChimeDevicesInternal = ({
  deviceController = defaultDeviceController,
  initialAudioInputDeviceId,
  initialAudioOutDeviceId,
  initialVideoInputDeviceId,
}: useChimeDevicesProps = {}): MediaDevicesResults => {
  const [mediaDevices, setMediaDevices] = useState<MediaDevices>({
    audioInputs: [],
    audioOutputs: [],
    videoInputs: [],
    currentAudioInputDeviceId: null,
    currentAudioOutputDeviceId: null,
    currentVideoInputDeviceId: null,
  });

  useEffect(() => {
    const createHandler = (key: string) => (list: MediaDeviceInfo[] = []) => {
      setMediaDevices(s => ({
        ...s,
        [key]: sanitize(list),
      }));
    };
    const observer = {
      audioInputsChanged: createHandler('audioInputs'),
      audioOutputsChanged: createHandler('audioOutputs'),
      videoInputsChanged: createHandler('videoInputs'),
    };

    const getCurrentLists = async () => {
      try {
        // get an array of all devices
        const mediaDevices = {
          audioInputs: sanitize(await deviceController.listAudioInputDevices()),
          audioOutputs: sanitize(
            await deviceController.listAudioOutputDevices()
          ),
          videoInputs: sanitize(await deviceController.listVideoInputDevices()),
        };

        // grab the zeroth elements of each array
        const [currentAudioInput] = mediaDevices.audioInputs;
        const [currentAudioOutput] = mediaDevices.audioOutputs;
        const [currentVideoInput] = mediaDevices.videoInputs;

        // compute current device ids
        const currentAudioInputDeviceId =
          initialAudioInputDeviceId ?? currentAudioInput?.deviceId ?? null;
        const currentAudioOutputDeviceId =
          initialAudioOutDeviceId ?? currentAudioOutput?.deviceId ?? null;
        const currentVideoInputDeviceId =
          initialVideoInputDeviceId ?? currentVideoInput?.deviceId ?? null;

        setMediaDevices({
          ...mediaDevices,
          currentAudioInputDeviceId,
          currentAudioOutputDeviceId,
          currentVideoInputDeviceId,
        });
      } catch (ex) {
        void 0;
      }
    };

    deviceController.addDeviceChangeObserver(observer);
    getCurrentLists();

    return () => {
      deviceController.removeDeviceChangeObserver(observer);
    };
  }, [
    deviceController,
    initialAudioInputDeviceId,
    initialAudioOutDeviceId,
    initialVideoInputDeviceId,
  ]);

  const result = useMemo(
    () => ({
      ...mediaDevices,
      currentAudioInputDeviceId: mustBeInList(
        mediaDevices.currentAudioInputDeviceId,
        mediaDevices.audioInputs
      ),
      currentAudioOutputDeviceId: mustBeInList(
        mediaDevices.currentAudioOutputDeviceId,
        mediaDevices.audioOutputs
      ),
      currentVideoInputDeviceId: mustBeInList(
        mediaDevices.currentVideoInputDeviceId,
        mediaDevices.videoInputs
      ),

      deviceController,
      setAudioInput: (id: string) => {
        setMediaDevices(s => ({ ...s, currentAudioInputDeviceId: id }));
      },
      setAudioOutput: (id: string) => {
        setMediaDevices(s => ({ ...s, currentAudioOutputDeviceId: id }));
      },
      setVideoInput: (id: string) => {
        setMediaDevices(s => ({ ...s, currentVideoInputDeviceId: id }));
      },
    }),
    [deviceController, mediaDevices]
  );
  return result;
};
