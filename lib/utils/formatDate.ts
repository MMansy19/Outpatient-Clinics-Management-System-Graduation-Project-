import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ar';

dayjs.extend(relativeTime);

export function formatDate(
  date: Date | string,
  format: string = 'DD/MM/YYYY',
  locale: 'en' | 'ar' = 'en'
): string {
  return dayjs(date).locale(locale).format(format);
}

export function formatRelative(
  date: Date | string,
  locale: 'en' | 'ar' = 'en'
): string {
  return dayjs(date).locale(locale).fromNow();
}

export function calculateAge(birthdate: Date | string): number {
  return dayjs().diff(dayjs(birthdate), 'year');
}
