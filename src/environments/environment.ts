// Local backend ile uzak backend arasında geçiş yapmak için bu değeri değiştirin
const useLocalBackend = true;

export const environment = {
  production: false,
  useLocalBackend: useLocalBackend,
  // useLocalBackend true ise doğrudan localhost:8080'e, false ise doğrudan uzak backend'e istek atar
  // Not: Uzak backend için HTTPS kullanılmalıdır, aksi halde Mixed Content hatası alınır
  apiUrl: useLocalBackend ? 'http://localhost:8080/api' : 'https://fanla.net/api'
};
