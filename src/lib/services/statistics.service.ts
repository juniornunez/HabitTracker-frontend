import api from '../api';

export interface RachaPorHabito {
  nombre: string;
  categoria: string;
  rachaActual: number;
  mejorRacha: number;
}

export interface ProgresoMensual {
  mes: string;
  total: number;
}

export interface CumplimientoPorCategoria {
  categoria: string;
  porcentaje: number;
}

export interface DetalleHabito {
  nombre: string;
  categoria: string;
  porcentajeCumplimiento: number;
  rachaActual: number;
}

export interface Statistics {
  totalHabitos: number;
  habitosActivos: number;
  habitosFinalizados: number;
  diasConsecutivos: number;
  progresoMensual: ProgresoMensual[];
  tendenciaCumplimiento: { completado: number; pendiente: number };
  rachasPorHabito: RachaPorHabito[];
  cumplimientoPorCategoria: CumplimientoPorCategoria[];
  detallePorHabito: DetalleHabito[];
}

export const getStatistics = async (): Promise<Statistics> => {
  const response = await api.get('/statistics');
  return response.data;
};