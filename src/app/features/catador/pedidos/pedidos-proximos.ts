import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Pedido } from '../../../core/models/app.models';
import { MATERIAIS, TipoMaterial } from '../../../core/models/enums';
import { ColetasService } from '../../../core/services/coletas.service';
import { converterErro } from '../../../core/utils/erro-api';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina';
import { PeriodoPipe, VolumePipe } from '../../../shared/pipes/rotulos.pipe';

/** Lista de pedidos do Catador. Com `modo: 'coletas'` (dado da rota) mostra os aceitos/concluídos. */
@Component({
  selector: 'app-pedidos-proximos',
  imports: [FormsModule, RouterLink, CabecalhoPagina, PeriodoPipe, VolumePipe],
  template: `
    <div class="pagina-app">
      <div class="container">
        <app-cabecalho-pagina
          [migalhas]="[{ rotulo: 'Home', link: '/catador' }, { rotulo: ehColetas() ? 'Minhas coletas' : 'Pedidos próximos' }]"
          [eyebrow]="ehColetas() ? 'Seu histórico' : 'Pedidos na sua região'"
          [titulo]="ehColetas() ? 'Minhas coletas' : 'Pedidos próximos'"
          [subtitulo]="ehColetas() ? 'Pedidos que você aceitou ou já concluiu.' : 'Pedidos da sua cidade nos materiais que você recolhe. Os do seu bairro aparecem primeiro.'"
        >
         
        </app-cabecalho-pagina>

        <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
          <select class="form-select form-select-sm w-auto" [ngModel]="material()" (ngModelChange)="material.set($event)" aria-label="Tipo de material">
            <option value="">Tipo de material</option>
            @for (m of materiais; track m.valor) {
              <option [value]="m.valor">{{ m.rotulo }}</option>
            }
          </select>
          <div class="form-check form-switch mb-0 ms-1">
            <input class="form-check-input" type="checkbox" role="switch" id="soBairro" [ngModel]="soMeuBairro()" (ngModelChange)="soMeuBairro.set($event)" />
            <label class="form-check-label small" for="soBairro">Só no meu bairro</label>
          </div>
          <small class="ms-auto text-secondary">{{ filtrados().length }} pedidos {{ ehColetas() ? '' : 'disponíveis' }}</small>
        </div>

        @if (erro()) {
          <div class="alert alert-warning small">{{ erro() }}</div>
        }

        <div class="d-grid gap-2">
          @for (p of filtrados(); track p.id) {
            <a [routerLink]="['/catador/pedidos', p.id]" class="linha card-borda">
              <span class="icone-circulo redondo"><i class="bi bi-recycle"></i></span>
              <span class="flex-grow-1 info">
                <strong class="d-block">{{ p.titulo }}</strong>
                <small class="text-secondary"><i class="bi bi-geo-alt"></i> {{ p.bairro }}@if (p.mesmoBairro) { • <span class="text-eco-verde fw-semibold">No seu bairro</span> }</small>
              </span>
              <span class="d-none d-md-block col-dado">
                <small class="text-secondary d-block">Período</small>
                <strong class="small">{{ p.periodo | periodo }}</strong>
              </span>
              <span class="d-none d-md-block col-dado">
                <small class="text-secondary d-block">Volume</small>
                <strong class="small">{{ p.volume | volume }}</strong>
              </span>
              <span class="status" [class.disponivel]="p.status === 'Disponivel'" [class.aceito]="p.status === 'Aceito'" [class.coletado]="p.status === 'Concluido'">
                {{ p.status === 'Disponivel' ? 'Disponível' : p.status === 'Aceito' ? 'Aceito' : 'Concluído' }}
              </span>
              <span class="small fw-semibold text-nowrap d-none d-sm-inline">Ver detalhes <i class="bi bi-arrow-right"></i></span>
            </a>
          } @empty {
            <div class="card-borda text-center text-secondary small py-5">Nenhum pedido por aqui.</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .linha {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      color: #1b1b1b;
      text-decoration: none;
    }
    .linha:hover {
      border-color: #3c7852;
    }
    .col-dado {
      width: 7rem;
    }
    .info {
      min-width: 0;
    }
  `,
})
export class PedidosProximos {
  private readonly coletas = inject(ColetasService);

  /** Vem do `data` da rota: 'proximos' | 'coletas' */
  readonly modo = input<'proximos' | 'coletas'>('proximos');
  readonly ehColetas = computed(() => this.modo() === 'coletas');

  readonly materiais = MATERIAIS;
  readonly material = signal<'' | TipoMaterial>('');
  readonly soMeuBairro = signal(false);
  readonly todos = signal<Pedido[]>([]);
  readonly erro = signal<string | null>(null);
  readonly filtrados = computed(() =>
    this.todos()
      .filter((p) => (this.ehColetas() ? p.status !== 'Disponivel' : p.status === 'Disponivel'))
      .filter((p) => !this.material() || p.material === this.material())
      .filter((p) => !this.soMeuBairro() || p.mesmoBairro)
      .sort((a, b) => Number(b.mesmoBairro) - Number(a.mesmoBairro)),
  );

  ngOnInit(): void {
    this.coletas.listarPedidos().subscribe({
      next: (l) => this.todos.set(l),
      error: (e) => this.erro.set(converterErro(e).mensagem),
    });
  }
}
