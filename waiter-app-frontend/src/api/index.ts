import axios, { AxiosResponse } from 'axios';

export const API_URL = (process.env.REACT_APP_API_BASE_URL || 'https://localhost:5000') + '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isJsonResponse = (response: AxiosResponse): boolean => {
  return response.headers['content-type']?.includes('application/json') ?? false;
};

const handleResponse = (response: AxiosResponse) => {
  if (isJsonResponse(response)) {
    return response.data;
  } else {
    console.error('Received non-JSON response:', response.data);
    throw new Error('Received non-JSON response from server');
  }
};

const logAndThrowError = (error: any) => {
  if (axios.isAxiosError(error)) {
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
  } else {
    console.error('Non-Axios Error:', error);
  }
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
    logAndThrowError(error);
    return Promise.reject(error);
  }
);

export const login = (email: string, password: string) => 
  api.post('/login', { email, password }).then(handleResponse).catch(logAndThrowError);

export const fetchShifts = () => 
  api.get('/shifts').then(handleResponse).catch(logAndThrowError);

export const createShift = (shiftData: any) => 
  api.post('/shifts', shiftData).then(handleResponse).catch(logAndThrowError);

export const updateShift = (shiftId: number, shiftData: any) => 
  api.put(`/shifts/${shiftId}`, shiftData).then(handleResponse).catch(logAndThrowError);

export const deleteShift = (shiftId: number) => 
  api.delete(`/shifts/${shiftId}`).then(handleResponse).catch(logAndThrowError);

export const fetchUsers = () => 
  api.get('/users').then(handleResponse).catch(logAndThrowError);

export const createUser = (userData: any) => 
  api.post('/users', userData).then(handleResponse).catch(logAndThrowError);

export const updateUser = (userId: number, userData: any) => 
  api.put(`/users/${userId}`, userData).then(handleResponse).catch(logAndThrowError);

export const deleteUser = (userId: number) => 
  api.delete(`/users/${userId}`).then(handleResponse).catch(logAndThrowError);

export const logout = () => 
  api.get('/logout').then(handleResponse).catch(logAndThrowError);