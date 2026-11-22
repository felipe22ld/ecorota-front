import { TipoMaterial } from './enums';

// Modelos das telas. Solicitação e Pedido já vêm da API (ColetasService);
// Prestador e PontoDescarte ainda são dados de exemplo (DadosExemploService).

export type StatusSolicitacao = 'AguardandoPrestador' | 'Aceito' | 'Coletando' | 'Coletado' | 'Recusado';
export type Volume = 'Baixo' | 'Grande';
export type TipoRetirada = 'Unica' | 'Fixa';
export type Periodo = 'Manha' | 'Tarde' | 'Noite';
export type DiaSemana = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sab' | 'Dom';

export const DIAS_SEMANA: { valor: DiaSemana; rotulo: string }[] = [
  { valor: 'Seg', rotulo: 'Seg' },
  { valor: 'Ter', rotulo: 'Ter' },
  { valor: 'Qua', rotulo: 'Qua' },
  { valor: 'Qui', rotulo: 'Qui' },
  { valor: 'Sex', rotulo: 'Sex' },
  { valor: 'Sab', rotulo: 'Sáb' },
  { valor: 'Dom', rotulo: 'Dom' },
];

export const PERIODOS: { valor: Periodo; rotulo: string }[] = [
  { valor: 'Manha', rotulo: 'Manhã' },
  { valor: 'Tarde', rotulo: 'Tarde' },
  { valor: 'Noite', rotulo: 'Noite' },
];

export interface NovaSolicitacao {
  material: TipoMaterial;
  outroMaterial?: string | null;
  volume: Volume;
  observacoes?: string | null;
  tipoRetirada: TipoRetirada;
  data?: string | null; // yyyy-MM-dd (retirada única)
  diasSemana?: DiaSemana[]; // retirada fixa
  periodo: Periodo;
  temFoto?: boolean;
}

export interface Solicitacao extends NovaSolicitacao {
  id: string;
  endereco: string;
  prestador?: string | null;
  status: StatusSolicitacao;
  criadaEm: string;
}

export interface Prestador {
  id: string;
  nome: string;
  bairro: string;
  distanciaKm: number;
  materiais: TipoMaterial[];
  whatsapp: string; // só dígitos com DDI, ex.: 5511912345678
}

export interface PontoDescarte {
  id: string;
  nome: string;
  endereco: string;
  distanciaKm: number;
  horario: string;
  telefone: string;
}

export type StatusPedido = 'Disponivel' | 'Aceito' | 'Concluido';

export interface Pedido {
  id: string;
  solicitante: string;
  material: TipoMaterial;
  titulo: string;
  endereco: string;
  bairro: string;
  /** No bairro de atuação do catador (a API ainda não calcula distância). */
  mesmoBairro: boolean;
  volume: Volume;
  periodo: Periodo;
  data: string;
  tipoRetirada: TipoRetirada;
  diasSemana: DiaSemana[];
  observacoes?: string;
  whatsapp: string;
  status: StatusPedido;
}

// ---- Rótulos ----

export function rotuloStatus(s: StatusSolicitacao): string {
  return {
    AguardandoPrestador: 'Aguardando prestador',
    Aceito: 'Aceito',
    Coletando: 'Coletando',
    Coletado: 'Coletado',
    Recusado: 'Recusado',
  }[s];
}

export function classeStatus(s: StatusSolicitacao): string {
  return {
    AguardandoPrestador: 'aguardando',
    Aceito: 'aceito',
    Coletando: 'coletando',
    Coletado: 'coletado',
    Recusado: 'recusado',
  }[s];
}

export function rotuloPeriodo(p: Periodo): string {
  return PERIODOS.find((x) => x.valor === p)?.rotulo ?? p;
}

export function rotuloVolume(v: Volume): string {
  return v === 'Baixo' ? 'Baixo' : 'Grande';
}

export function rotuloRetirada(s: Pick<NovaSolicitacao, 'tipoRetirada' | 'data' | 'diasSemana' | 'periodo'>): string {
  if (s.tipoRetirada === 'Fixa') {
    const dias = (s.diasSemana ?? [])
      .map((d) => DIAS_SEMANA.find((x) => x.valor === d)?.rotulo ?? d)
      .join(', ');
    return `Fixa / Recorrente • ${dias || '—'} • ${rotuloPeriodo(s.periodo)}`;
  }
  return `Retirada única • ${formatarData(s.data)} • ${rotuloPeriodo(s.periodo)}`;
}

export function formatarData(iso?: string | null): string {
  if (!iso) return '—';
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}
