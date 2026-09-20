import { Habit } from './services/habits.service';
import { getHondurasWeekday } from './date';

export const DIAS_SEMANA = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'] as const;
export type DiaSemana = (typeof DIAS_SEMANA)[number];

export const DIAS_SEMANA_LABELS: Record<DiaSemana, string> = {
  dom: 'Dom',
  lun: 'Lun',
  mar: 'Mar',
  mie: 'Mié',
  jue: 'Jue',
  vie: 'Vie',
  sab: 'Sáb',
};

/** Día de la semana de hoy, calculado en hora de Honduras. */
export function getTodayCode(): DiaSemana {
  return DIAS_SEMANA[getHondurasWeekday()];
}

export interface HabitTracking {
  completadoHoy: boolean;
  ultimoCumplimiento: string | null;
  rachaActual: number;
  mejorRacha: number;
}

export interface ClassifiedHabits {
  diarios: Habit[];
  semanales: Habit[];
  personalizados: Habit[];
}

/**
 * Agrupa los hábitos simplemente por su tipo de frecuencia,
 * sin ninguna lógica de "vencimiento": diario, semanal o personalizada.
 */
export function classifyHabits(habits: Habit[]): ClassifiedHabits {
  const diarios: Habit[] = [];
  const semanales: Habit[] = [];
  const personalizados: Habit[] = [];

  for (const habit of habits) {
    if (habit.frecuencia === 'diario') {
      diarios.push(habit);
    } else if (habit.frecuencia === 'semanal') {
      semanales.push(habit);
    } else {
      personalizados.push(habit);
    }
  }

  return { diarios, semanales, personalizados };
}

/**
 * Decide si HOY corresponde mostrar el botón de completar un hábito:
 * - diario y semanal: siempre se puede completar
 * - personalizada: solo si hoy (en hora de Honduras) es uno de los
 *   días configurados en diasPersonalizados
 */
export function canCompleteToday(habit: Habit): boolean {
  if (habit.frecuencia === 'personalizada') {
    const today = getTodayCode();
    return (habit.diasPersonalizados || []).includes(today);
  }
  return true;
}