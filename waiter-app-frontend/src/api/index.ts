import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const logAndThrowError = (error: any) => {
  console.error('API Error:', error.response || error);
  throw error;
};

export const login = (email: string, password: string) => 
  api.post('/login', { email, password }).catch(logAndThrowError);

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

export const logout = () => 
  api.get('/logout').catch(logAndThrowError);

api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);