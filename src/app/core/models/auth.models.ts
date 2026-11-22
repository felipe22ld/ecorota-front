import { PerfilUsuario } from './enums';

// POST /api/auth/login — o login é pelo telefone.
// A API normaliza o número (aceita "(11) 99999-8888" ou "+5511999998888").
export interface LoginRequest {
  telefone: string;
  senha: string;
}

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  perfil: PerfilUsuario;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiraEm: string; // DateTimeOffset em ISO 8601
  usuario: UsuarioAutenticado;
}
