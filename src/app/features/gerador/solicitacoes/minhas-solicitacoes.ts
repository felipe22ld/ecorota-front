import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Solicitacao, StatusSolicitacao, rotuloStatus } from '../../../core/models/app.models';
import { ColetasService } from '../../../core/services/coletas.service';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina';
import { TabelaSolicitacoes } from './tabela-solicitacoes';

@Component({
  selector: 'app-minhas-solicitacoes',
  imports: [FormsModule, CabecalhoPagina, TabelaSolicitacoes],
  template: `
    <div class="pagina-app">
      <div class="container">
        <app-cabecalho-pagina
          [migalhas]="[{ rotulo: 'Home', link: '/gerador' }, { rotulo: 'Minhas solicitações' }]"
          eyebrow="Suas retiradas"
          titulo="Minhas solicitações"
          subtitulo="Acompanhe o status das suas retiradas."
        >
         
        </app-cabecalho-pagina>

        <select class="form-select form-select-sm w-auto mb-3" [ngModel]="filtro()" (ngModelChange)="filtro.set($event)" aria-label="Filtrar por status">
          <option value="">Status</option>
          @for (s of status; track s) {
            <option [value]="s">{{ rotulo(s) }}</option>
          }
        </select>

        @if (carregando()) {
          <div class="text-center py-5"><span class="spinner-border text-success"></span></div>
        } @else {
          <app-tabela-solicitacoes [solicitacoes]="filtradas()" />
        }
      </div>
    </div>
  `,
})
export class MinhasSolicitacoes {
  private readonly coletas = inject(ColetasService);

  readonly status: StatusSolicitacao[] = ['AguardandoPrestador', 'Aceito', 'Coletando', 'Coletado', 'Recusado'];
  readonly filtro = signal<'' | StatusSolicitacao>('');
  readonly carregando = signal(true);
  readonly todas = signal<Solicitacao[]>([]);
  readonly filtradas = computed(() => {
    const f = this.filtro();
    return f ? this.todas().filter((s) => s.status === f) : this.todas();
  });

  ngOnInit(): void {
    this.coletas.listarSolicitacoes().subscribe((lista) => {
      this.todas.set(lista);
      this.carregando.set(false);
    });
  }

  rotulo(s: StatusSolicitacao): string {
    return rotuloStatus(s);
  }
}
