
import {isTstingWithTmp, tmpData} from './tmpData'

const initialState = {
  internal: {
    appState: '',
    prevAppState: '',
    isDebugMode: false,
    isPopupMode: false,
    isDebugInterface: false,
    isHavingScanningPermmision: false,
    connectionTimeout: 45000,
    connection: {},
  },
  peripherals: {
    list: isTstingWithTmp ? tmpData : [],
  },
  logs: {
    data: [
    ],
    updated_at: null,
  },
  error: null,
};

export {
  initialState,
};


