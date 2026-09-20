import api from '../api';

export interface HabitRecord {
  _id: string;
  habito: string;
  usuario: string;
  fecha: string;
  completado: boolean;
}

export interface Streak {
  rachaActual: number;
  mejorRacha: number;
}

export const markCompleteToday = async (habitId: string): Promise<HabitRecord> => {
  const response = await api.post(`/habits/${habitId}/complete`, {});
  return response.data;
};

export const unmarkCompleteToday = async (habitId: string): Promise<void> => {
  await api.delete(`/habits/${habitId}/complete`);
};

export const getHistory = async (habitId: string): Promise<HabitRecord[]> => {
  const response = await api.get(`/habits/${habitId}/history`);
  return response.data;
};

export const getStreak = async (habitId: string): Promise<Streak> => {
  const response = await api.get(`/habits/${habitId}/streak`);
  return response.data;
};

export const getCompletionRate = async (
  habitId: string,
  days = 7,
): Promise<number> => {
  const response = await api.get(`/habits/${habitId}/completion-rate`, {
    params: { days },
  });
  return response.data;
};