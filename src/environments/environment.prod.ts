export const environment = {
  production: true,
  useLocalBackend: false,
  // Production ortamında doğrudan backend URL'sine istek atıyoruz
  // Vercel proxy'si ile sorun yaşandığı için doğrudan HTTPS URL kullanıyoruz
  apiUrl: 'https://fanla-backen-zmnemj-981630-94-154-32-75.traefik.me/api'
};
