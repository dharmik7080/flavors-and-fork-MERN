import { io } from 'socket.io-client';

// Auto-select backend URL based on environment (Vite DEV mode vs PROD)
const BACKEND_URL = import.meta.env.DEV
  ? 'http://localhost:5001'
  : 'https://flavors-and-fork-mern.onrender.com';

console.log(`[SOCKET INITIALIZATION] Targeting backend URL: ${BACKEND_URL}`);

export const socket = io(BACKEND_URL, {
  withCredentials: true,
  autoConnect: true
});
