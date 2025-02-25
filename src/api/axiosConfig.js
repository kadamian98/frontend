import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:4000/api', // Asegúrate de que esta URL apunte a tu backend
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;