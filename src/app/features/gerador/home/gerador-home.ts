import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Solicitacao } from '../../../core/models/app.models';
import { ColetasService } from '../../../core/services/coletas.service';
import { SessaoService } from '../../../core/services/sessao.service';
import { TabelaSolicitacoes } from '../solicitacoes/tabela-solicitacoes';

@Component({
  selector: 'app-gerador-home',
  imports: [RouterLink, TabelaSolicitacoes],
  template: `
    <div class="pagina-app">
      <div class="container">
        <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <span class="eco-eyebrow mb-1">Seu dia</span>
            <h1 class="eco-titulo mb-1">Olá, {{ primeiroNome() }}</h1>
            <p class="eco-subtitulo small mb-0">O que você quer fazer hoje?</p>
          </div>
          <span class="chip"><i class="bi bi-geo-alt text-eco-verde"></i> Vila Mariana, São Paulo</span>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <a routerLink="nova-solicitacao" class="acao acao-verde">
              <span class="icone-circulo bg-white text-eco-verde"><i class="bi bi-plus-lg"></i></span>
              <span class="flex-grow-1">
                <strong class="d-block">Pedir retirada</strong>
                <small>Informe o material e encontre quem recolha perto de você.</small>
              </span>
              <i class="bi bi-arrow-right fs-5"></i>
            </a>
          </div>
          <div class="col-md-6">
            <a routerLink="pontos-descarte" class="acao acao-branca">
              <span class="icone-circulo navy"><i class="bi bi-geo-alt"></i></span>
              <span class="flex-grow-1">
                <strong class="d-block">Ver pontos de descarte</strong>
                <small class="text-secondary">Encontre ecopontos e locais de entrega na sua região.</small>
              </span>
              <i class="bi bi-arrow-right fs-5"></i>
            </a>
          </div>
        </div>

        <h2 class="h5 fw-normal mb-3">Acessos rápidos</h2>
        <div class="row g-3 mb-5">
          <div class="col-md-6">
            <a routerLink="solicitacoes" class="atalho card-borda">
              <span class="icone-circulo"><i class="bi bi-list-ul"></i></span>
              <strong class="small flex-grow-1">Minhas solicitações</strong>
              <i class="bi bi-arrow-right"></i>
            </a>
          </div>
          <div class="col-md-6">
            <a routerLink="prestadores" class="atalho card-borda">
              <span class="icone-circulo"><i class="bi bi-person"></i></span>
              <strong class="small flex-grow-1">Prestadores próximos</strong>
              <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-end mb-3">
          <div>
            <h2 class="h5 fw-normal mb-1">Atividade recente</h2>
            <p class="small text-secondary mb-0">Acompanhe suas últimas solicitações.</p>
          </div>
          <a routerLink="solicitacoes" class="small">Ver todas <i class="bi bi-arrow-right"></i></a>
        </div>

        @if (carregando()) {
          <div class="text-center py-5"><span class="spinner-border text-success"></span></div>
        } @else {
          <app-tabela-solicitacoes [solicitacoes]="recentes()" />
        }
      </div>
    </div>
  `,
  styles: `
    .acao {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 0.9rem;
      text-decoration: none;
      min-height: 7.5rem;
      transition: transform 0.15s;
    }
    .acao:hover {
      transform: translateY(-2px);
    }
    .acao-verde {
      background: #3c7852;
      color: #fff;
    }
    .acao-branca {
      background: #fff;
      color: #1b1b1b;
      border: 1px solid #2b2b2b;
    }
    .atalho {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 0.85rem 1rem;
      color: #1b1b1b;
      text-decoration: none;
    }
    .atalho .icone-circulo {
      width: 2.2rem;
      height: 2.2rem;
      font-size: 1rem;
    }
  `,
})
export class GeradorHome {
  private readonly coletas = inject(ColetasService);
  private readonly sessao = inject(SessaoService);

  readonly primeiroNome = computed(() => this.sessao.usuario()?.nome.split(' ')[0] ?? 'Usuário');
  readonly carregando = signal(true);
  readonly recentes = signal<Solicitacao[]>([]);

  ngOnInit(): void {
    this.coletas.listarSolicitacoes().subscribe((lista) => {
      this.recentes.set(lista.slice(0, 4));
      this.carregando.set(false);
    });
  }
}
