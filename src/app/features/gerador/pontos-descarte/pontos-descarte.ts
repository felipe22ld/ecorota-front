import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PontoDescarte } from '../../../core/models/app.models';
import { DadosExemploService } from '../../../core/services/dados-exemplo.service';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina';
import { SeloMock } from '../../../shared/components/selo-mock';

@Component({
  selector: 'app-pontos-descarte',
  imports: [FormsModule, DecimalPipe, CabecalhoPagina, SeloMock],
  template: `
    <div class="pagina-app">
      <div class="container">
        <app-cabecalho-pagina
          [migalhas]="[{ rotulo: 'Home', link: '/gerador' }, { rotulo: 'Pontos de descarte' }]"
          eyebrow="Descarte por conta própria"
          titulo="Pontos de descarte"
          subtitulo="Locais próximos para você levar seus recicláveis."
        >
          <app-selo-mock />
        </app-cabecalho-pagina>

        <div class="d-flex align-items-center mb-3">
          <select class="form-select form-select-sm w-auto" [ngModel]="distancia()" (ngModelChange)="distancia.set(+$event)" aria-label="Distância">
            <option [ngValue]="0">Distância</option>
            <option [ngValue]="2">Até 2 km</option>
            <option [ngValue]="5">Até 5 km</option>
          </select>
          <small class="ms-auto text-secondary">{{ filtrados().length }} pontos encontrados</small>
        </div>

        <div class="d-grid gap-3">
          @for (p of filtrados(); track p.id) {
            <div class="card-borda p-3 d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
              <span class="icone-circulo"><i class="bi bi-geo-alt"></i></span>
              <div class="flex-grow-1">
                <strong class="d-block">{{ p.nome }}</strong>
                <small class="d-block text-secondary">{{ p.endereco }}</small>
                <small class="text-eco-verde fw-semibold">{{ p.distanciaKm | number: '1.1-1' }} km</small>
                <small class="text-secondary"> • {{ p.horario }}</small>
              </div>
              <a [href]="tel(p)" class="btn btn-outline-success btn-sm">
                <i class="bi bi-telephone"></i> {{ p.telefone }}
              </a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class PontosDescarte {
  private readonly dados = inject(DadosExemploService);

  readonly distancia = signal(0);
  readonly todos = signal<PontoDescarte[]>([]);
  readonly filtrados = computed(() => this.todos().filter((p) => !this.distancia() || p.distanciaKm <= this.distancia()));

  tel(p: PontoDescarte): string {
    return 'tel:' + p.telefone.replace(/\D/g, '');
  }

  ngOnInit(): void {
    this.dados.listarPontos().subscribe((l) => this.todos.set(l));
  }
}
