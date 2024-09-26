import axios, { AxiosError, AxiosResponse } from 'axios';
import { createBrowserHistory } from 'history';

export const API_URL = (process.env.REACT_APP_API_BASE_URL || 'https://localhost:5000') + '/api';

const history = createBrowserHistory();

interface ErrorResponse {
  message: string;
  new_token?: string;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000, // Increase timeout to 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});




const logAndThrowError = (error: AxiosError) => {
  console.error('API Error:', error.response || error);
  throw error;
};

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
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      const data = error.response.data as ErrorResponse;
      
      if (data && typeof data === 'object' && 'new_token' in data && typeof data.new_token === 'string') {
        // Token expired, update with new token
        localStorage.setItem('authToken', data.new_token);
        if (error.config) {
          error.config.headers['Authorization'] = `Bearer ${data.new_token}`;
          return axios.request(error.config);
        }
      } else {
        // Other 401 error, remove token and redirect to signin
        localStorage.removeItem('authToken');
        history.push('/signin');
      }
    }
    return Promise.reject(error);
  }
);


const retryRequest = async (fn: () => Promise<AxiosResponse>, retries = 3, delay = 1000): Promise<AxiosResponse> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error) && (!error.response || error.response.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await retryRequest(() => api.post('/login', { email, password }));
    localStorage.setItem('authToken', response.data.auth_token);
    return response;
  } catch (error) {
    return logAndThrowError(error as AxiosError);
  }
};

export const fetchShifts = () => retryRequest(() => api.get('/shifts')).catch(logAndThrowError);

export const createShift = (shiftData: any) => 
  retryRequest(() => api.post('/shifts', shiftData)).catch(logAndThrowError);

export const updateShift = (shiftId: number, shiftData: any) => 
  retryRequest(() => api.put(`/shifts/${shiftId}`, shiftData)).catch(logAndThrowError);

export const deleteShift = (shiftId: number) => 
  retryRequest(() => api.delete(`/shifts/${shiftId}`)).catch(logAndThrowError);

export const fetchUsers = () => 
  retryRequest(() => api.get('/users')).catch(logAndThrowError);

export const createUser = (userData: any) => 
  retryRequest(() => api.post('/users', userData)).catch(logAndThrowError);

export const updateUser = (userId: number, userData: any) => 
  retryRequest(() => api.put(`/users/${userId}`, userData)).catch(logAndThrowError);

export const deleteUser = (userId: number) => 
  retryRequest(() => api.delete(`/users/${userId}`)).catch(logAndThrowError);

export const logout = async () => {
  try {
    const response = await retryRequest(() => api.get('/logout'));
    localStorage.removeItem('authToken');
    return response;
  } catch (error) {
    return logAndThrowError(error as AxiosError);
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