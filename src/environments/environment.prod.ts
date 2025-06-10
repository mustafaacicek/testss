export const environment = {
  production: true,
  useLocalBackend: false,
  // SSL sertifikası sorunu nedeniyle Vercel proxy'sini kullanıyoruz
  // Bu sayede tarayıcı SSL hatası vermeyecek
  apiUrl: '/api'
};
