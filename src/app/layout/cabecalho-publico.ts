import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../shared/components/logo';
import { SessaoService } from '../core/services/sessao.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-cabecalho-publico',
  imports: [RouterLink, Logo],
  template: `
    <header class="cabecalho bg-white border-bottom sticky-top">
      <nav class="container d-flex align-items-center justify-content-between py-2">
        <app-logo />

        <ul class="d-none d-lg-flex list-unstyled gap-4 mb-0 small">
          <li><a routerLink="/" fragment="como-funciona" class="link-nav">Como funciona</a></li>
          <li><a routerLink="/" fragment="beneficios" class="link-nav">Benefícios</a></li>
          <li><a routerLink="/" fragment="para-quem" class="link-nav">Para quem</a></li>
        </ul>

        <div class="d-none d-lg-flex gap-2">
          @if (sessao.autenticado()) {
            <a [routerLink]="auth.rotaInicial()" class="btn btn-primary btn-sm px-3">Ir para o app</a>
          } @else {
            <a routerLink="/login" class="btn btn-primary btn-sm px-3">Entrar</a>
            <a routerLink="/cadastro" class="btn btn-navy btn-sm px-3">Criar conta</a>
          }
        </div>

        <button
          type="button"
          class="btn btn-link text-dark d-lg-none p-1 fs-3"
          [attr.aria-expanded]="aberto()"
          aria-label="Abrir menu"
          (click)="aberto.set(!aberto())"
        >
          <i class="bi" [class.bi-list]="!aberto()" [class.bi-x-lg]="aberto()"></i>
        </button>
      </nav>

      @if (aberto()) {
        <div class="d-lg-none border-top bg-white">
          <div class="container py-3 d-grid gap-3">
            <a routerLink="/" fragment="como-funciona" class="link-nav" (click)="aberto.set(false)">Como funciona</a>
            <a routerLink="/" fragment="beneficios" class="link-nav" (click)="aberto.set(false)">Benefícios</a>
            <a routerLink="/" fragment="para-quem" class="link-nav" (click)="aberto.set(false)">Para quem</a>
            @if (sessao.autenticado()) {
              <a [routerLink]="auth.rotaInicial()" class="btn btn-primary">Ir para o app</a>
            } @else {
              <a routerLink="/login" class="btn btn-primary">Entrar</a>
              <a routerLink="/cadastro" class="btn btn-navy">Criar conta</a>
            }
          </div>
        </div>
      }
    </header>
  `,
  styles: `
    .link-nav {
      color: #1b1b1b;
      font-weight: 500;
      text-decoration: none;
    }
    .link-nav:hover {
      color: #3c7852;
    }
  `,
})
export class CabecalhoPublico {
  readonly sessao = inject(SessaoService);
  readonly auth = inject(AuthService);
  readonly aberto = signal(false);
}
