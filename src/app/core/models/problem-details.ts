// Formato de erro devolvido pelo ExceptionHandlingMiddleware da API (application/problem+json).
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  // Presente no 422: { "Email": ["E-mail já cadastrado."], "Endereco.Cep": ["..."] }
  errors?: Record<string, string[]>;
  // Presente no 403 do login: "telefone_nao_confirmado" | "conta_bloqueada"
  codigo?: string;
  // Presente quando codigo = "telefone_nao_confirmado": link do bot no Telegram
  linkConfirmacaoTelegram?: string;
}

// Erro já tratado, pronto para a tela exibir.
export interface ErroApi {
  status: number;
  mensagem: string;
  // Erros por campo, com as chaves já em camelCase (ex.: "email", "endereco.cep").
  campos: Record<string, string[]>;
  codigo?: string;
  linkConfirmacaoTelegram?: string;
}
