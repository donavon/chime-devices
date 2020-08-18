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

type useChimeDevicesProps = {
  deviceController?: DefaultDeviceController;
};

export const useChimeDevicesInternal = ({
  deviceController = defaultDeviceController,
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
    const observer = {
      audioInputsChanged: (list: MediaDeviceInfo[] = []) => {
        setMediaDevices(s => ({
          ...s,
          audioInputs: sanitize(list),
        }));
      },
      audioOutputsChanged: (list: MediaDeviceInfo[] = []) => {
        setMediaDevices(s => ({
          ...s,
          audioOutputs: sanitize(list),
        }));
      },
      videoInputsChanged: (list: MediaDeviceInfo[] = []) => {
        setMediaDevices(s => ({
          ...s,
          videoInputs: sanitize(list),
        }));
      },
    };

    const getCurrentLists = async () => {
      const mediaDevices = {
        audioInputs: sanitize(await deviceController.listAudioInputDevices()),
        audioOutputs: sanitize(await deviceController.listAudioOutputDevices()),
        videoInputs: sanitize(await deviceController.listVideoInputDevices()),
      };

      const [currentAudioInput] = mediaDevices.audioInputs;
      const [currentAudioOutput] = mediaDevices.audioOutputs;
      const [currentVideoInput] = mediaDevices.videoInputs;

      setMediaDevices(s => ({
        ...s,
        ...mediaDevices,
        currentAudioInputDeviceId: currentAudioInput?.deviceId ?? null,
        currentAudioOutputDeviceId: currentAudioOutput?.deviceId ?? null,
        currentVideoInputDeviceId: currentVideoInput?.deviceId ?? null,
      }));
    };

    deviceController.addDeviceChangeObserver(observer);
    getCurrentLists();

    return () => {
      deviceController.removeDeviceChangeObserver(observer);
    };
  }, [deviceController]);

  const result = useMemo(
    () => ({
      ...mediaDevices,
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
