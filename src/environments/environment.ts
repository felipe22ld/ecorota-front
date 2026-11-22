// Produção: aponte apiUrl para o endereço público da API (ex.: API Gateway da AWS).
export const environment = {
  production: true,
  apiUrl: 'https://SUA-API.execute-api.us-east-1.amazonaws.com',
  // Quando true, as telas que ainda não têm endpoint usam dados de exemplo.
  usarMocks: true,
};
