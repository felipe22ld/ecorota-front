import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pedido } from '../../../core/models/app.models';
import { ColetasService } from '../../../core/services/coletas.service';
import { SessaoService } from '../../../core/services/sessao.service';
import { PeriodoPipe } from '../../../shared/pipes/rotulos.pipe';

@Component({
  selector: 'app-catador-home',
  imports: [RouterLink, DecimalPipe, PeriodoPipe],
  template: `
    <div class="pagina-app">
      <div class="container">
        <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <span class="eco-eyebrow mb-1">Seu dia</span>
            <h1 class="eco-titulo mb-1">Olá, {{ primeiroNome() }}</h1>
            <p class="eco-subtitulo small mb-0">Veja os pedidos perto de você e organize suas próximas coletas.</p>
          </div>
          <span class="chip"><i class="bi bi-geo-alt text-eco-verde"></i> Vila Mariana, São Paulo</span>
        </div>

        <a routerLink="pedidos" class="banner mb-4">
          <span class="icone-circulo bg-white text-eco-verde"><i class="bi bi-geo-alt"></i></span>
          <span class="flex-grow-1">
            <small class="opacity-75 d-block">Pedidos na sua região</small>
            <strong class="fs-4 fw-semibold d-block">Ver pedidos próximos</strong>
            <small class="opacity-75">Encontre materiais disponíveis e organize sua rota de coleta.</small>
          </span>
          <span class="contador d-none d-sm-flex">
            <strong>{{ disponiveis().length | number: '2.0-0' }}</strong>
            <small>disponíveis</small>
          </span>
          <i class="bi bi-arrow-right fs-4"></i>
        </a>

        <h2 class="h5 fw-normal mb-3">Resumo</h2>
        <div class="row g-3 mb-4">
          @for (r of resumo(); track r.titulo) {
            <div class="col-md-4">
              <div class="card-borda p-3 d-flex justify-content-between align-items-center">
                <div>
                  <strong class="small d-block">{{ r.titulo }}</strong>
                  <small class="text-secondary">{{ r.desc }}</small>
                </div>
                <span class="fs-2 fw-light">{{ r.valor | number: '2.0-0' }}</span>
              </div>
            </div>
          }
        </div>

        <h2 class="h5 fw-normal mb-3">Acessos rápidos</h2>
        <div class="row g-3 mb-5">
          <div class="col-md-4">
            <a routerLink="coletas" class="atalho card-borda">
              <span class="icone-circulo"><i class="bi bi-list-ul"></i></span>
              <strong class="small flex-grow-1">Minhas coletas</strong>
              <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-end mb-3">
          <div>
            <h2 class="h5 fw-normal mb-1">Próximos pedidos</h2>
            <p class="small text-secondary mb-0">Os do seu bairro aparecem primeiro.</p>
          </div>
          <a routerLink="pedidos" class="small">Ver todos <i class="bi bi-arrow-right"></i></a>
        </div>

        <div class="row g-3">
          @for (p of disponiveis().slice(0, 3); track p.id) {
            <div class="col-md-4">
              <div class="card-borda p-3 h-100 d-flex flex-column">
                <div class="d-flex justify-content-between mb-3">
                  <span class="icone-circulo redondo" style="width: 2rem; height: 2rem; font-size: 0.9rem"><i class="bi bi-recycle"></i></span>
                  <span class="status disponivel">Disponível</span>
                </div>
                <strong class="mb-2">{{ p.titulo }}</strong>
                <small class="text-secondary"><i class="bi bi-geo-alt"></i> {{ p.bairro }}@if (p.mesmoBairro) { • <span class="text-eco-verde fw-semibold">No seu bairro</span> }</small>
                <small class="text-secondary mb-3"><i class="bi bi-clock"></i> {{ p.periodo | periodo }}</small>
                <a [routerLink]="['pedidos', p.id]" class="small mt-auto pt-2 border-top d-flex justify-content-between">
                  Ver detalhes <i class="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 0.9rem;
      color: #fff;
      text-decoration: none;
      background: linear-gradient(120deg, #3c7852 0%, #5d9a70 100%);
    }
    .contador {
      flex-direction: column;
      align-items: center;
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 0.6rem;
      padding: 0.4rem 0.8rem;
      line-height: 1.1;
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
export class CatadorHome {
  private readonly coletas = inject(ColetasService);
  private readonly sessao = inject(SessaoService);

  readonly primeiroNome = computed(() => this.sessao.usuario()?.nome.split(' ')[0] ?? 'Usuário');
  readonly pedidos = signal<Pedido[]>([]);
  readonly disponiveis = computed(() => this.pedidos().filter((p) => p.status === 'Disponivel'));
  readonly resumo = computed(() => [
    { titulo: 'Pedidos disponíveis', desc: 'Na sua região de atuação', valor: this.disponiveis().length },
    { titulo: 'Pedidos aceitos', desc: 'Para retirar', valor: this.pedidos().filter((p) => p.status === 'Aceito').length },
    { titulo: 'Coletas concluídas', desc: 'Desde o cadastro', valor: this.pedidos().filter((p) => p.status === 'Concluido').length },
  ]);

  ngOnInit(): void {
    this.coletas.listarPedidos().subscribe({ next: (l) => this.pedidos.set(l), error: () => {} });
  }
}
