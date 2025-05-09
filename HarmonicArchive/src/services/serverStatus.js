import axios from 'axios';

const SERVER_HEALTH_URL = 'http://192.168.100.2:5000/api/health';

export const checkNetworkStatus = () => navigator.onLine;

export const checkServerStatus = async () => {
  if (!checkNetworkStatus()) {
    return { network: false, server: false };
  }
  try {
    await axios.get(SERVER_HEALTH_URL);
    return { network: true, server: true };
  } catch (error) {
    return { network: true, server: false };
  }
};