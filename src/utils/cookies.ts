// Cookie utility functions
export const setCookie = (name: string, value: string, days: number = 365): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Language preference management
export const LANGUAGE_COOKIE = 'preferred_language';
export const HIDE_LANG_POPUP_COOKIE = 'hide_lang_popup';
export const COOKIE_CONSENT_COOKIE = 'cookie_consent';

export const setLanguagePreference = (language: string): void => {
  setCookie(LANGUAGE_COOKIE, language);
};

export const getLanguagePreference = (): string | null => {
  return getCookie(LANGUAGE_COOKIE);
};

export const setHideLangPopup = (): void => {
  setCookie(HIDE_LANG_POPUP_COOKIE, 'true');
};

export const shouldShowLangPopup = (): boolean => {
  return getCookie(HIDE_LANG_POPUP_COOKIE) !== 'true';
};

export const setCookieConsent = (consent: 'all' | 'essential' | 'custom'): void => {
  setCookie(COOKIE_CONSENT_COOKIE, consent);
};

export const getCookieConsent = (): string | null => {
  return getCookie(COOKIE_CONSENT_COOKIE);
};

export const shouldShowCookieConsent = (): boolean => {
  return getCookie(COOKIE_CONSENT_COOKIE) === null;
};