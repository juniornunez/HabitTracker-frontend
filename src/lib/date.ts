const HONDURAS_TIMEZONE = 'America/Tegucigalpa';

/**
 * Devuelve la fecha (YYYY-MM-DD) calculada SIEMPRE en la zona horaria de
 * Honduras (America/Tegucigalpa), sin importar cómo esté configurado el
 * navegador del usuario. Usa Intl.DateTimeFormat en vez de los métodos
 * locales de Date para no depender de la zona horaria del dispositivo.
 */
export function getHondurasDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: HONDURAS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Devuelve el día de la semana (0 = domingo ... 6 = sábado) correspondiente
 * al calendario de Honduras, no al del navegador del usuario.
 */
export function getHondurasWeekday(date: Date = new Date()): number {
  const dateStr = getHondurasDateString(date);
  return new Date(`${dateStr}T00:00:00.000Z`).getUTCDay();
}

/** Dado un string "YYYY-MM-DD", devuelve el lunes de esa semana en el
 * mismo formato (sin conversión de zona horaria, todo por string/UTC). */
export function getWeekStartString(dateStr: string): string {
  const d = new Date(`${dateStr.slice(0, 10)}T00:00:00.000Z`);
  const weekday = d.getUTCDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** El lunes de la semana actual, calculada en hora de Honduras. */
export function getCurrentHondurasWeekStart(): string {
  return getWeekStartString(getHondurasDateString());
}