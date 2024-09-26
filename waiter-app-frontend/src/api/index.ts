import axios from 'axios';

export const API_URL = (process.env.REACT_APP_API_BASE_URL || 'https://localhost:5000') + '/api';

   const api = axios.create({
     baseURL: API_URL,
     withCredentials: true,
     headers: {
       'Content-Type': 'application/json',
     },
   });


const logAndThrowError = (error: any) => {
  console.error('API Error:', error.response || error);
  throw error;
};


// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('API Request Error:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token has expired or is invalid
      localStorage.removeItem('authToken');
      // Redirect to login page
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/login', { email, password });
    localStorage.setItem('authToken', response.data.auth_token);
    return response;
  } catch (error) {
    logAndThrowError(error);
  }
};

export const fetchShifts = () => 
  api.get('/shifts').catch(logAndThrowError);

export const createShift = (shiftData: any) => 
  api.post('/shifts', shiftData).catch(logAndThrowError);

export const updateShift = (shiftId: number, shiftData: any) => 
  api.put(`/shifts/${shiftId}`, shiftData).catch(logAndThrowError);

export const deleteShift = (shiftId: number) => 
  api.delete(`/shifts/${shiftId}`).catch(logAndThrowError);

export const fetchUsers = () => 
  api.get('/users').catch(logAndThrowError);

export const createUser = (userData: any) => 
  api.post('/users', userData).catch(logAndThrowError);

export const updateUser = (userId: number, userData: any) => 
  api.put(`/users/${userId}`, userData).catch(logAndThrowError);

export const deleteUser = (userId: number) => 
  api.delete(`/users/${userId}`).catch(logAndThrowError);

export const logout = async () => {
  try {
    const response = await api.get('/logout');
    localStorage.removeItem('authToken');
    return response;
  } catch (error) {
    logAndThrowError(error);
  }
};

export const changePassword = (currentPassword: string, newPassword: string) => 
  api.post('/change_password', { current_password: currentPassword, new_password: newPassword }).catch(logAndThrowError);


export const resetPasswordRequest = (email: string) => 
  api.post('/reset_password_request', { email }).catch(logAndThrowError);

export const resetPassword = (token: string, password: string) => 
  api.post('/reset_password', { token, password }).catch(logAndThrowError);

export const setPassword = (token: string, password: string) => 
  api.post('/set_password', { token, password }).catch(logAndThrowError);
