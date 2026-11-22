import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pedido, rotuloRetirada } from '../../../core/models/app.models';
import { ColetasService } from '../../../core/services/coletas.service';
import { MaterialPipe, VolumePipe } from '../../../shared/pipes/rotulos.pipe';

@Component({
  selector: 'app-pedido-aceito',
  imports: [RouterLink, MaterialPipe, VolumePipe],
  template: `
    <div class="pagina-app">
      <div class="container">
        <nav class="breadcrumb-eco">
          <a routerLink="/catador">Home</a><span>/</span>
          <a routerLink="/catador/pedidos">Pedidos próximos</a><span>/</span>
          <span class="atual">Pedido aceito</span>
        </nav>

        @if (pedido(); as p) {
          <div class="card-eco p-4 p-md-5 mx-auto text-center" style="max-width: 40rem">
            <span class="icone-circulo redondo solido mb-2" style="width: 3.2rem; height: 3.2rem"><i class="bi bi-shield-check"></i></span>
            <span class="eco-eyebrow d-block">Pedido aceito</span>
            <h1 class="eco-titulo mb-2">Esta coleta agora é sua</h1>
            <p class="small text-secondary mb-3">
              O solicitante recebeu a atualização. O pedido foi removido da lista pública e faz parte das suas coletas.
            </p>
            <span class="status aceito">Aceito</span>

            <div class="grade-detalhes text-start mt-4">
              <div>
                <span class="rotulo"><i class="bi bi-geo-alt"></i> Local</span>
                <span class="valor">{{ p.endereco }} — {{ p.bairro }}</span>
              </div>
              <div>
                <span class="rotulo"><i class="bi bi-recycle"></i> Material</span>
                <span class="valor">{{ p.material | material }}</span>
              </div>
              <div>
                <span class="rotulo"><i class="bi bi-box-seam"></i> Volume</span>
                <span class="valor">{{ p.volume | volume }}</span>
              </div>
              <div>
                <span class="rotulo"><i class="bi bi-clock"></i> Retirada</span>
                <span class="valor">{{ retirada(p) }}</span>
              </div>
            </div>

            <div class="row g-2 mt-4">
              <div class="col-sm-6">
                <a [href]="whatsapp(p)" target="_blank" rel="noopener" class="btn btn-primary w-100">
                  Falar pelo WhatsApp <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
              <div class="col-sm-6">
                <a routerLink="/catador/pedidos" class="btn btn-navy w-100">Voltar aos pedidos</a>
              </div>
            </div>
          </div>
        } @else {
          <div class="text-center py-5"><span class="spinner-border text-success"></span></div>
        }
      </div>
    </div>
  `,
})
export class PedidoAceito {
  private readonly coletas = inject(ColetasService);
  readonly id = input.required<string>();
  readonly pedido = signal<Pedido | null>(null);

  ngOnInit(): void {
    this.coletas.obterPedido(this.id()).subscribe({ next: (p) => this.pedido.set(p), error: () => {} });
  }

  retirada(p: Pedido): string {
    return rotuloRetirada({ tipoRetirada: p.tipoRetirada, data: p.data, diasSemana: p.diasSemana, periodo: p.periodo });
  }

  whatsapp(p: Pedido): string {
    return `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(`Olá, ${p.solicitante}! Aceitei sua coleta de ${p.titulo.toLowerCase()} pela EcoRota.`)}`;
  }
}
