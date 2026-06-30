import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000/api' 
  : 'https://flavors-and-fork-mern.onrender.com/api';

// Globally configure Axios base URL for both dev and prod deployments
axios.defaults.baseURL = import.meta.env.DEV 
  ? 'http://localhost:3000' 
  : 'https://flavors-and-fork-mern.onrender.com';

// Ensure cookie credentials are included for session persistence (deletesession, savesession, fetchsession)
axios.defaults.withCredentials = true;

export default API_BASE_URL;
