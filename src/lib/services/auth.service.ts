import api from '../api';

export interface RegisterPayload {
  nombre: string;
  correo: string;
  contraseña: string;
}

export interface LoginPayload {
  correo: string;
  contraseña: string;
}

export const registerUser = async (data: RegisterPayload) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: LoginPayload) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};