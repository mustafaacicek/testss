// Local backend ile uzak backend arasında geçiş yapmak için bu değeri değiştirin
const useLocalBackend = false;

export const environment = {
  production: false,
  useLocalBackend: useLocalBackend,
  // useLocalBackend true ise doğrudan localhost:8080'e, false ise doğrudan uzak backend'e istek atar
  apiUrl: useLocalBackend ? 'http://localhost:8080/api' : 'http://fanla-backen-zmnemj-981630-94-154-32-75.traefik.me/api'
};
