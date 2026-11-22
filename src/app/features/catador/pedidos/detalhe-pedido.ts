import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Pedido, rotuloRetirada } from '../../../core/models/app.models';
import { ColetasService } from '../../../core/services/coletas.service';
import { converterErro } from '../../../core/utils/erro-api';
import { AvisoService } from '../../../shared/services/aviso.service';
import { MaterialPipe, VolumePipe } from '../../../shared/pipes/rotulos.pipe';

@Component({
  selector: 'app-detalhe-pedido',
  imports: [RouterLink, MaterialPipe, VolumePipe],
  template: `
    <div class="pagina-app">
      <div class="container">
        <nav class="breadcrumb-eco">
          <a routerLink="/catador">Home</a><span>/</span>
          <a routerLink="/catador/pedidos">Pedidos próximos</a><span>/</span>
          <span class="atual">Detalhes do pedido</span>
        </nav>

        @if (erro()) {
          <div class="alert alert-warning">{{ erro() }}</div>
        } @else {
          @if (pedido(); as p) {
          <div class="card-eco p-4 p-md-5 mx-auto" style="max-width: 52rem">
            <div class="d-flex justify-content-between align-items-start">
              <span class="eco-eyebrow">Detalhes do pedido</span>
             
            </div>
            <h1 class="eco-titulo mb-1">{{ p.titulo }}</h1>
            <p class="small text-secondary mb-3">Confira as informações antes de aceitar.</p>
            <span class="status mb-4" [class.disponivel]="p.status === 'Disponivel'" [class.aceito]="p.status !== 'Disponivel'">
              {{ p.status === 'Disponivel' ? 'Disponível' : p.status === 'Aceito' ? 'Aceito' : 'Concluído' }}
            </span>

            <div class="row g-4 mt-1">
              <div class="col-md-6">
                <ul class="list-unstyled lista-dados mb-0">
                  <li><i class="bi bi-person"></i><span><strong>Solicitante</strong>{{ p.solicitante }}</span></li>
                  <li><i class="bi bi-recycle"></i><span><strong>Material</strong>{{ p.material | material }}</span></li>
                  <li><i class="bi bi-geo-alt"></i><span><strong>Local</strong>{{ p.endereco }} — {{ p.bairro }}@if (p.mesmoBairro) { • No seu bairro }</span></li>
                  <li><i class="bi bi-box-seam"></i><span><strong>Volume</strong>{{ p.volume | volume }}</span></li>
                  <li><i class="bi bi-calendar-check"></i><span><strong>Retirada</strong>{{ retirada(p) }}</span></li>
                </ul>
              </div>
              <div class="col-md-6">
                <div class="foto-pedido">
                  <i class="bi bi-image"></i>
                  <small>Foto enviada pelo solicitante</small>
                </div>
              </div>
            </div>

            @if (p.observacoes) {
              <div class="aviso-suave mt-4"><strong class="d-block small">Observações</strong>{{ p.observacoes }}</div>
            }

            @if (p.status === 'Disponivel') {
              <div class="row g-2 mt-4">
                <div class="col-sm-6">
                  <button type="button" class="btn btn-primary w-100" [disabled]="processando()" (click)="aceitar(p)">Aceitar pedido</button>
                </div>
                <div class="col-sm-6">
                  <button type="button" class="btn btn-navy w-100" [disabled]="processando()" (click)="recusar(p)">Recusar</button>
                </div>
              </div>
            } @else if (p.whatsapp) {
              <a [href]="whatsapp(p)" target="_blank" rel="noopener" class="btn btn-primary w-100 mt-4">
                <i class="bi bi-whatsapp me-1"></i> Falar pelo WhatsApp
              </a>
            }
          </div>
          } @else {
            <div class="text-center py-5"><span class="spinner-border text-success"></span></div>
          }
        }
      </div>
    </div>
  `,
  styles: `
    .lista-dados li {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e2e5e3;
      font-size: 0.85rem;
      color: #5f6661;
    }
    .lista-dados li:last-child {
      border-bottom: 0;
    }
    .lista-dados i {
      color: #3c7852;
      font-size: 1.05rem;
    }
    .lista-dados strong {
      display: block;
      color: #1b1b1b;
    }
    .foto-pedido {
      height: 100%;
      min-height: 14rem;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #e4e6e5, #cfd6d2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #5f6661;
      gap: 0.4rem;
    }
    .foto-pedido i {
      font-size: 2.5rem;
    }
  `,
})
export class DetalhePedido {
  private readonly coletas = inject(ColetasService);
  private readonly router = inject(Router);
  private readonly avisos = inject(AvisoService);

  readonly id = input.required<string>();
  readonly pedido = signal<Pedido | null>(null);
  readonly erro = signal<string | null>(null);
  readonly processando = signal(false);

  ngOnInit(): void {
    this.coletas.obterPedido(this.id()).subscribe({
      next: (p) => this.pedido.set(p),
      error: () => this.erro.set('Pedido não encontrado.'),
    });
  }

  aceitar(p: Pedido): void {
    this.processando.set(true);
    this.coletas
      .aceitarPedido(p.id)
      .pipe(finalize(() => this.processando.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/catador/pedidos', p.id, 'aceito']),
        error: (e) => {
          // 409: outro catador aceitou antes. Volta para a lista, que já não mostra o pedido.
          const erro = converterErro(e);
          this.avisos.erro(erro.mensagem);
          if (erro.status === 409) this.router.navigateByUrl('/catador/pedidos');
        },
      });
  }

  recusar(p: Pedido): void {
    this.coletas.recusarPedido(p.id);
    this.avisos.info('Pedido recusado. Ele não aparecerá mais para você neste dispositivo.');
    this.router.navigateByUrl('/catador/pedidos');
  }

  retirada(p: Pedido): string {
    return rotuloRetirada({ tipoRetirada: p.tipoRetirada, data: p.data, diasSemana: p.diasSemana, periodo: p.periodo });
  }

  whatsapp(p: Pedido): string {
    return `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(`Olá, ${p.solicitante}! Aceitei sua coleta de ${p.titulo.toLowerCase()} pela EcoRota.`)}`;
  }
}
