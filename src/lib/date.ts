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