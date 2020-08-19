import React, { useContext } from 'react';
import { DefaultDeviceController } from 'amazon-chime-sdk-js';
import {
  useChimeDevicesInternal,
  MediaDevicesResults,
} from './useChimeDevicesInternal';

const ChimeDevicesContext = React.createContext<MediaDevicesResults | null>(
  null
);

type ChimeDevicesProviderProps = {
  deviceController?: DefaultDeviceController;
  initialAudioInputDeviceId?: string;
  initialAudioOutDeviceId?: string;
  initialVideoInputDeviceId?: string;
};

export const ChimeDevicesProvider: React.FC<ChimeDevicesProviderProps> = ({
  deviceController,
  initialAudioInputDeviceId,
  initialAudioOutDeviceId,
  initialVideoInputDeviceId,
  children,
}) => {
  const value = useChimeDevicesInternal({
    deviceController,
    initialAudioInputDeviceId,
    initialAudioOutDeviceId,
    initialVideoInputDeviceId,
  });

  return (
    <ChimeDevicesContext.Provider value={value}>
      {children}
    </ChimeDevicesContext.Provider>
  );
};

const throwDevicesError = () => {
  throw new Error('useChimeDevices must be a child of <ChimeDevicesProvider>');
};

export const useChimeDevices = () =>
  useContext(ChimeDevicesContext) || throwDevicesError();
