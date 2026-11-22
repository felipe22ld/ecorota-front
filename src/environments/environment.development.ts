// Desenvolvimento: apiUrl vazio = as chamadas vão para /api no próprio ng serve,
// e o proxy.conf.json repassa para http://localhost:5134 (sua API .NET).
// Assim não é preciso configurar CORS na API durante o desenvolvimento.
export const environment = {
  production: false,
  apiUrl: '',
  usarMocks: true,
};
