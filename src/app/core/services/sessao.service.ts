import { Injectable, computed, signal } from '@angular/core';
import { LoginResponse, UsuarioAutenticado } from '../models/auth.models';

const CHAVE = 'ecorota.sessao';

interface Sessao {
  token: string;
  expiraEm: string;
  usuario: UsuarioAutenticado;
}

/** Guarda o token e o usuário logado (localStorage) e expõe tudo como signals. */
@Injectable({ providedIn: 'root' })
export class SessaoService {
  private readonly sessao = signal<Sessao | null>(this.carregar());

  readonly usuario = computed(() => this.sessao()?.usuario ?? null);
  readonly token = computed(() => this.sessao()?.token ?? null);
  readonly perfil = computed(() => this.sessao()?.usuario.perfil ?? null);
  readonly autenticado = computed(() => {
    const s = this.sessao();
    return !!s && new Date(s.expiraEm).getTime() > Date.now();
  });

  iniciar(resposta: LoginResponse): void {
    const sessao: Sessao = {
      token: resposta.accessToken,
      expiraEm: resposta.expiraEm,
      usuario: resposta.usuario,
    };
    this.salvar(sessao);
    this.sessao.set(sessao);
  }

  atualizarUsuario(usuario: UsuarioAutenticado): void {
    const atual = this.sessao();
    if (!atual) return;
    const nova = { ...atual, usuario };
    this.salvar(nova);
    this.sessao.set(nova);
  }

  encerrar(): void {
    try {
      localStorage.removeItem(CHAVE);
    } catch {
      /* armazenamento indisponível */
    }
    this.sessao.set(null);
  }

  private carregar(): Sessao | null {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return null;
      const s = JSON.parse(bruto) as Sessao;
      return new Date(s.expiraEm).getTime() > Date.now() ? s : null;
    } catch {
      return null;
    }
  }

  private salvar(s: Sessao): void {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(s));
    } catch {
      /* armazenamento indisponível */
    }
  }
}
