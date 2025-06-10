export const environment = {
  production: true,
  // Relative path kullanarak Vercel proxy'sine yönlendiriyoruz
  // Bu sayede Vercel'in kendi proxy'si üzerinden backend'e istek yapılır ve HTTPS kullanılır
  apiUrl: '/api'
};
