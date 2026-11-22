import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { SessaoService } from '../core/services/sessao.service';
import { Logo } from '../shared/components/logo';
import { AvisoService } from '../shared/services/aviso.service';

/** Moldura da área logada (Gerador e Catador): cabeçalho com notificações e menu do perfil. */
@Component({
  selector: 'app-layout-app',
  imports: [RouterOutlet, RouterLink, Logo],
  template: `
    <header class="bg-white border-bottom sticky-top">
      <div class="container d-flex align-items-center justify-content-between" style="height: 64px">
        <app-logo [link]="base()" />

        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn-sino" aria-label="Notificações" (click)="notificacoes()">
            <i class="bi bi-bell"></i>
            <span class="badge-ponto">2</span>
          </button>

          <div class="position-relative">
            <button type="button" class="btn-perfil" [attr.aria-expanded]="menuAberto()" (click)="menuAberto.set(!menuAberto())">
              <span class="avatar">{{ iniciais() }}</span>
              <span class="text-start d-none d-sm-block lh-sm">
                <strong class="d-block small">{{ primeiroNome() }}</strong>
                <small class="text-secondary">{{ rotuloPerfil() }}</small>
              </span>
              <i class="bi bi-chevron-down small text-secondary"></i>
            </button>

            @if (menuAberto()) {
              <div class="menu-perfil card-borda shadow-sm">
                <a [routerLink]="base() + '/perfil'" class="item" (click)="menuAberto.set(false)">
                  <i class="bi bi-person"></i> Ver perfil
                </a>
                <button type="button" class="item text-danger" (click)="sair()">
                  <i class="bi bi-box-arrow-right"></i> Sair
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>

    <router-outlet />
  `,
  styles: `
    .btn-sino {
      position: relative;
      width: 2.5rem;
      height: 2.5rem;
      border: 1px solid #e2e5e3;
      border-radius: 0.6rem;
      background: #fff;
    }
    .badge-ponto {
      position: absolute;
      top: -0.3rem;
      right: -0.3rem;
      background: #c0392b;
      color: #fff;
      font-size: 0.6rem;
      font-weight: 700;
      border-radius: 999px;
      padding: 0.1rem 0.35rem;
    }
    .btn-perfil {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      border: 1px solid #e2e5e3;
      border-radius: 0.6rem;
      background: #fff;
      padding: 0.3rem 0.6rem 0.3rem 0.3rem;
    }
    .avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 0.45rem;
      background: #ebf5ed;
      color: #2c5b3b;
      font-weight: 700;
      font-size: 0.8rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .menu-perfil {
      position: absolute;
      right: 0;
      top: calc(100% + 0.4rem);
      min-width: 11rem;
      padding: 0.35rem;
      z-index: 1050;
    }
    .menu-perfil .item {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      width: 100%;
      padding: 0.55rem 0.7rem;
      border: 0;
      background: none;
      border-radius: 0.4rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: inherit;
      text-decoration: none;
    }
    .menu-perfil .item:hover {
      background: #f0f2f1;
    }
  `,
})
export class LayoutApp {
  private readonly sessao = inject(SessaoService);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(AvisoService);
  private readonly el = inject(ElementRef<HTMLElement>);

  readonly menuAberto = signal(false);
  readonly base = computed(() => (this.sessao.perfil() === 'Catador' ? '/catador' : '/gerador'));
  readonly primeiroNome = computed(() => this.sessao.usuario()?.nome.split(' ')[0] ?? 'Usuário');
  readonly rotuloPerfil = computed(() => (this.sessao.perfil() === 'Catador' ? 'Prestador' : 'Gerador'));
  readonly iniciais = computed(() =>
    (this.sessao.usuario()?.nome ?? 'U')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join(''),
  );

  ngOnInit(): void {
    // Confirma o token com a API e atualiza nome/telefone (GET /api/auth/usuario).
    this.auth.me().subscribe({ error: () => {} });
  }

  @HostListener('document:click', ['$event'])
  fecharMenuAoClicarFora(evento: MouseEvent): void {
    if (this.menuAberto() && !this.el.nativeElement.querySelector('.btn-perfil')?.contains(evento.target as Node)) {
      const menu = this.el.nativeElement.querySelector('.menu-perfil');
      if (!menu?.contains(evento.target as Node)) this.menuAberto.set(false);
    }
  }

  notificacoes(): void {
    this.avisos.info('Notificações ainda não têm endpoint na API.');
  }

  sair(): void {
    this.menuAberto.set(false);
    this.auth.sair();
  }
}
