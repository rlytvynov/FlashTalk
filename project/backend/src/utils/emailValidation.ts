/**
 * Проверява дали имейл адресът е във валиден формат
 */
export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)