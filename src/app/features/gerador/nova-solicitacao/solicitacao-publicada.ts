import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Solicitacao, rotuloRetirada } from '../../../core/models/app.models';
import { ColetasService } from '../../../core/services/coletas.service';
import { PIPES_ROTULOS } from '../../../shared/pipes/rotulos.pipe';

@Component({
  selector: 'app-solicitacao-publicada',
  imports: [RouterLink, ...PIPES_ROTULOS],
  template: `
    <div class="pagina-app">
      <div class="container">
        <nav class="breadcrumb-eco">
          <a routerLink="/gerador">Home</a><span>/</span>
          <a routerLink="/gerador/nova-solicitacao">Nova solicitação</a><span>/</span>
          <span class="atual">Solicitação publicada</span>
        </nav>

        @if (s(); as sol) {
          <div class="card-eco p-4 p-md-5 mx-auto text-center" style="max-width: 40rem">
            <span class="icone-circulo redondo solido mb-2" style="width: 3.2rem; height: 3.2rem"><i class="bi bi-shield-check"></i></span>
            <span class="eco-eyebrow d-block">Solicitação publicada</span>
            <h1 class="eco-titulo mb-2">Seu pedido foi aberto com sucesso!</h1>
            <p class="small text-secondary mb-3">Prestadores próximos já podem visualizar e aceitar sua solicitação.</p>
            <span class="status" [class]="sol.status | classeStatus">{{ sol.status | status }}</span>

            <div class="grade-detalhes text-start mt-4">
              <div>
                <span class="rotulo"><i class="bi bi-geo-alt"></i> Local</span>
                <span class="valor">{{ sol.endereco }}</span>
              </div>
              <div>
                <span class="rotulo"><i class="bi bi-recycle"></i> Material</span>
                <span class="valor">{{ sol.material | material: sol.outroMaterial }}</span>
              </div>
              <div>
                <span class="rotulo"><i class="bi bi-box-seam"></i> Volume</span>
                <span class="valor">{{ sol.volume | volume }}</span>
              </div>
              <div>
                <span class="rotulo"><i class="bi bi-calendar-check"></i> Retirada</span>
                <span class="valor">{{ retirada(sol) }}</span>
              </div>
            </div>

            <div class="row g-2 mt-4">
              <div class="col-sm-6">
                <a [routerLink]="['/gerador/solicitacoes', sol.id]" class="btn btn-primary w-100">Acompanhar solicitação</a>
              </div>
              <div class="col-sm-6">
                <a routerLink="/gerador/nova-solicitacao" class="btn btn-navy w-100">Nova solicitação</a>
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
export class SolicitacaoPublicada {
  private readonly coletas = inject(ColetasService);
  readonly id = input.required<string>();
  readonly s = signal<Solicitacao | null>(null);

  ngOnInit(): void {
    this.coletas.obterSolicitacao(this.id()).subscribe({ next: (s) => this.s.set(s), error: () => {} });
  }

  retirada(s: Solicitacao): string {
    return rotuloRetirada(s);
  }
}
