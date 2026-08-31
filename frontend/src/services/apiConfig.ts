export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://api.evidentia.io.vn' : '');
