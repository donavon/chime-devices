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
};

export const ChimeDevicesProvider: React.FC<ChimeDevicesProviderProps> = ({
  deviceController,
  children,
}) => {
  const value = useChimeDevicesInternal({ deviceController });

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
