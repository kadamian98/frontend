import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://backend-dc2l.onrender.com/api', // Asegúrate de que esta URL apunte a tu backend
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;