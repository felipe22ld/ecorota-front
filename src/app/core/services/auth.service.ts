import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioAutenticado } from '../models/auth.models';
import {
  CadastrarCatadorRequest,
  CadastrarGeradorRequest,
  CadastroResponse,
} from '../models/cadastro.models';
import { SessaoService } from './sessao.service';

/** Endpoints de /api/auth já existentes no back-end (AuthController). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(SessaoService);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}/api/auth`;

  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/login`, dados)
      .pipe(tap((resposta) => this.sessao.iniciar(resposta)));
  }

  me(): Observable<UsuarioAutenticado> {
    return this.http
      .get<UsuarioAutenticado>(`${this.base}/usuario`)
      .pipe(tap((u) => this.sessao.atualizarUsuario(u)));
  }

  cadastrarCatador(dados: CadastrarCatadorRequest): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(`${this.base}/cadastrar-catador`, dados);
  }

  cadastrarGerador(dados: CadastrarGeradorRequest): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(`${this.base}/cadastrar-gerador`, dados);
  }

  sair(): void {
    this.sessao.encerrar();
    this.router.navigateByUrl('/');
  }

  /** Rota inicial de acordo com o perfil do usuário logado. */
  rotaInicial(): string {
    return this.sessao.perfil() === 'Catador' ? '/catador' : '/gerador';
  }
}
