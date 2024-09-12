import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const login = (email: string, password: string) => 
  api.post('/login', { email, password });

export const fetchShifts = () => 
  api.get('/shifts');

export const createShift = (shiftData: any) => 
  api.post('/shifts', shiftData);

export const updateShift = (shiftId: number, shiftData: any) => 
  api.put(`/shifts/${shiftId}`, shiftData);

export const deleteShift = (shiftId: number) => 
  api.delete(`/shifts/${shiftId}`);

export const fetchUsers = () => 
  api.get('/users');

export const createUser = (userData: any) => 
  api.post('/users', userData);

export const updateUser = (userId: number, userData: any) => 
  api.put(`/users/${userId}`, userData);

export const deleteUser = (userId: number) => 
  api.delete(`/users/${userId}`);

export const logout = () => 
  api.get('/logout');