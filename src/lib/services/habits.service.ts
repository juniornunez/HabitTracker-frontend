import api from '../api';

export interface Habit {
  _id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  frecuencia: 'diario' | 'semanal' | 'personalizada';
  diasPersonalizados?: string[];
  prioridad: number;
  fechaInicio: string;
  fechaFin?: string;
  activo: boolean;
  usuario: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitPayload {
  nombre: string;
  descripcion?: string;
  categoria?: string;
  frecuencia: 'diario' | 'semanal' | 'personalizada';
  diasPersonalizados?: string[];
  prioridad?: number;
  fechaInicio: string;
  fechaFin?: string;
  activo?: boolean;
}

export type UpdateHabitPayload = Partial<CreateHabitPayload>;

export const getHabits = async (): Promise<Habit[]> => {
  const response = await api.get('/habits');
  return response.data;
};

export const getHabit = async (id: string): Promise<Habit> => {
  const response = await api.get(`/habits/${id}`);
  return response.data;
};

export const createHabit = async (data: CreateHabitPayload): Promise<Habit> => {
  const response = await api.post('/habits', data);
  return response.data;
};

export const updateHabit = async (
  id: string,
  data: UpdateHabitPayload,
): Promise<Habit> => {
  const response = await api.patch(`/habits/${id}`, data);
  return response.data;
};

export const deleteHabit = async (id: string): Promise<void> => {
  await api.delete(`/habits/${id}`);
};