export const setCookie = (name: string, value: string, options: { httpOnly?: boolean; path?: string } = {}) => {
  const { httpOnly = false, path = '/' } = options;
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}`;
  if (httpOnly) {
    cookieString += '; HttpOnly';
  }
  document.cookie = cookieString;
};

export const getCookie = (name: string): string | null => {
  const matches = document.cookie.match(
    new RegExp(`(?:^|; )${encodeURIComponent(name).replace(/([.*+?^${}()|[\]/\\])/g, '\\$1')}=([^;]*)`)
  );
  return matches ? decodeURIComponent(matches[1]) : null;
};

export const deleteCookie = (name: string, path: string = '/'): void => {
  document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const generateSessionId = (): string => {
  return 'sess_' + Math.random().toString(36).substr(2, 9);
};