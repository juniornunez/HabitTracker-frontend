export type PriorityColor = 'success' | 'warning' | 'error' | 'default';

export interface PriorityInfo {
  label: string;
  color: PriorityColor;
}

export function getPriorityInfo(prioridad: number): PriorityInfo {
  switch (prioridad) {
    case 3:
      return { label: 'Alta', color: 'error' };
    case 2:
      return { label: 'Media', color: 'warning' };
    case 1:
    default:
      return { label: 'Baja', color: 'success' };
  }
}