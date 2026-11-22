import { PerfilUsuario, TipoLocal, TipoMaterial } from './enums';

export interface EnderecoDto {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
}

// POST /api/auth/cadastrar-catador
export interface CadastrarCatadorRequest {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  cidade: string;
  bairro: string;
  materiais: TipoMaterial[];
  outrosMateriais?: string | null;
}

// POST /api/auth/cadastrar-gerador
export interface CadastrarGeradorRequest {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  tipoLocal: TipoLocal;
  nomeEstabelecimento?: string | null;
  endereco: EnderecoDto;
}

export interface CadastroResponse {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  perfil: PerfilUsuario;
  telefoneConfirmado: boolean;
  mensagem: string;
  // Bot do EcoRota no Telegram, onde o usuário confirma o telefone compartilhando o número
  linkConfirmacaoTelegram: string;
}
