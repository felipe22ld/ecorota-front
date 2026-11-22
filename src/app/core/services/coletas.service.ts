import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DiaSemana,
  NovaSolicitacao,
  Pedido,
  Periodo,
  Solicitacao,
  StatusPedido,
  StatusSolicitacao,
  TipoRetirada,
  Volume,
} from '../models/app.models';
import { EnderecoDto } from '../models/cadastro.models';
import { TipoMaterial, rotuloMaterial } from '../models/enums';
import { SessaoService } from './sessao.service';

// ---- DTOs da API (SolicitacoesController / PedidosController) ----

interface SolicitacaoApi {
  id: string;
  material: TipoMaterial;
  outroMaterial: string | null;
  volume: Volume;
  observacoes: string | null;
  tipoRetirada: TipoRetirada;
  data: string | null;
  diasSemana: DiaSemana[];
  periodo: Periodo;
  endereco: EnderecoDto;
  prestador: string | null;
  status: StatusSolicitacao;
  criadaEm: string;
}

interface PedidoApi {
  id: string;
  solicitante: string;
  material: TipoMaterial;
  outroMaterial: string | null;
  volume: Volume;
  observacoes: string | null;
  tipoRetirada: TipoRetirada;
  data: string | null;
  diasSemana: DiaSemana[];
  periodo: Periodo;
  endereco: EnderecoDto;
  status: StatusSolicitacao;
  mesmoBairro: boolean;
  telefone: string | null;
  criadaEm: string;
}

/**
 * Solicitações de coleta (Gerador) e pedidos (Catador) — endpoints reais da API.
 * Converte os DTOs para os modelos que as telas já usavam com os dados de exemplo.
 */
@Injectable({ providedIn: 'root' })
export class ColetasService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);
  private readonly api = environment.apiUrl;

  // ================= Gerador =================

  listarSolicitacoes(): Observable<Solicitacao[]> {
    return this.http.get<SolicitacaoApi[]>(`${this.api}/api/solicitacoes`).pipe(map((l) => l.map(paraSolicitacao)));
  }

  obterSolicitacao(id: string): Observable<Solicitacao> {
    return this.http.get<SolicitacaoApi>(`${this.api}/api/solicitacoes/${id}`).pipe(map(paraSolicitacao));
  }

  criarSolicitacao(dados: NovaSolicitacao): Observable<Solicitacao> {
    const corpo = {
      material: dados.material,
      outroMaterial: dados.material === 'Outros' ? dados.outroMaterial : null,
      volume: dados.volume,
      observacoes: dados.observacoes || null,
      tipoRetirada: dados.tipoRetirada,
      data: dados.tipoRetirada === 'Unica' ? dados.data : null,
      diasSemana: dados.tipoRetirada === 'Fixa' ? dados.diasSemana : [],
      periodo: dados.periodo,
    };
    return this.http.post<SolicitacaoApi>(`${this.api}/api/solicitacoes`, corpo).pipe(map(paraSolicitacao));
  }

  /** Endereço do cadastro do gerador, onde as coletas acontecem. */
  obterEnderecoColeta(): Observable<string> {
    return this.http
      .get<EnderecoDto>(`${this.api}/api/solicitacoes/endereco-coleta`)
      .pipe(map(formatarEndereco));
  }

  // ================= Catador =================

  /** Disponíveis na região + os que o catador já aceitou. */
  listarPedidos(): Observable<Pedido[]> {
    return forkJoin([
      this.http.get<PedidoApi[]>(`${this.api}/api/pedidos/disponiveis`),
      this.http.get<PedidoApi[]>(`${this.api}/api/pedidos/meus`),
    ]).pipe(
      map(([disponiveis, meus]) => {
        const recusados = this.recusados();
        return [...disponiveis.filter((p) => !recusados.has(p.id)), ...meus].map(paraPedido);
      }),
    );
  }

  obterPedido(id: string): Observable<Pedido> {
    return this.http.get<PedidoApi>(`${this.api}/api/pedidos/${id}`).pipe(map(paraPedido));
  }

  aceitarPedido(id: string): Observable<Pedido> {
    return this.http.post<PedidoApi>(`${this.api}/api/pedidos/${id}/aceitar`, {}).pipe(map(paraPedido));
  }

  /**
   * A API ainda não guarda recusas: o pedido fica oculto só neste navegador.
   * TODO API: POST /api/pedidos/{id}/recusar
   */
  recusarPedido(id: string): void {
    const recusados = this.recusados();
    recusados.add(id);
    try {
      localStorage.setItem(this.chaveRecusados(), JSON.stringify([...recusados]));
    } catch {
      /* sem storage (aba anônima etc.): a recusa vale só até recarregar */
    }
  }

  private recusados(): Set<string> {
    try {
      return new Set(JSON.parse(localStorage.getItem(this.chaveRecusados()) ?? '[]') as string[]);
    } catch {
      return new Set();
    }
  }

  private chaveRecusados(): string {
    return `ecorota.recusados.${this.sessao.usuario()?.id ?? 'anonimo'}`;
  }
}

// ---- Conversões ----

export function formatarEndereco(e: EnderecoDto): string {
  const complemento = e.complemento ? ` (${e.complemento})` : '';
  return `${e.logradouro}, ${e.numero}${complemento} — ${e.bairro}, ${e.cidade}`;
}

function paraSolicitacao(s: SolicitacaoApi): Solicitacao {
  return {
    id: s.id,
    material: s.material,
    outroMaterial: s.outroMaterial,
    volume: s.volume,
    observacoes: s.observacoes,
    tipoRetirada: s.tipoRetirada,
    data: s.data,
    diasSemana: s.diasSemana,
    periodo: s.periodo,
    endereco: formatarEndereco(s.endereco),
    prestador: s.prestador,
    status: s.status,
    criadaEm: s.criadaEm,
  };
}

function statusPedido(s: StatusSolicitacao): StatusPedido {
  if (s === 'AguardandoPrestador') return 'Disponivel';
  if (s === 'Coletado') return 'Concluido';
  return 'Aceito';
}

function paraPedido(p: PedidoApi): Pedido {
  return {
    id: p.id,
    solicitante: p.solicitante,
    material: p.material,
    titulo: p.material === 'Outros' && p.outroMaterial ? p.outroMaterial : rotuloMaterial(p.material),
    endereco: `${p.endereco.logradouro}, ${p.endereco.numero}${p.endereco.complemento ? ` (${p.endereco.complemento})` : ''}`,
    bairro: p.endereco.bairro,
    mesmoBairro: p.mesmoBairro,
    volume: p.volume,
    periodo: p.periodo,
    data: p.data ?? '',
    tipoRetirada: p.tipoRetirada,
    diasSemana: p.diasSemana,
    observacoes: p.observacoes ?? undefined,
    // wa.me usa só dígitos com DDI; vazio enquanto o pedido não for deste catador.
    whatsapp: (p.telefone ?? '').replace(/\D/g, ''),
    status: statusPedido(p.status),
  };
}
