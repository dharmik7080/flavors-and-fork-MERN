import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV 
  ? (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3000/api')
  : (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

// Globally configure Axios base URL for both dev and prod deployments
axios.defaults.baseURL = import.meta.env.DEV 
  ? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  : (typeof window !== 'undefined' ? window.location.origin : '');

// Ensure cookie credentials are included for session persistence (deletesession, savesession, fetchsession)
axios.defaults.withCredentials = true;

export default API_BASE_URL;
