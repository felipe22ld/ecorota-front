import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Prestador } from '../../../core/models/app.models';
import { MATERIAIS, TipoMaterial } from '../../../core/models/enums';
import { DadosExemploService } from '../../../core/services/dados-exemplo.service';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina';
import { SeloMock } from '../../../shared/components/selo-mock';
import { MaterialPipe } from '../../../shared/pipes/rotulos.pipe';

@Component({
  selector: 'app-prestadores-proximos',
  imports: [FormsModule, RouterLink, DecimalPipe, CabecalhoPagina, SeloMock, MaterialPipe],
  template: `
    <div class="pagina-app">
      <div class="container">
        <app-cabecalho-pagina
          [migalhas]="[{ rotulo: 'Home', link: '/gerador' }, { rotulo: 'Prestadores próximos' }]"
          eyebrow="Perto de você"
          titulo="Prestadores próximos"
          subtitulo="Explore quem recolhe na sua região e filtre por material."
        >
          <app-selo-mock />
        </app-cabecalho-pagina>

        <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
          <select class="form-select form-select-sm w-auto" [ngModel]="material()" (ngModelChange)="material.set($event)" aria-label="Tipo de material">
            <option value="">Tipo de material</option>
            @for (m of materiais; track m.valor) {
              <option [value]="m.valor">{{ m.rotulo }}</option>
            }
          </select>
          <select class="form-select form-select-sm w-auto" [ngModel]="distancia()" (ngModelChange)="distancia.set(+$event)" aria-label="Distância">
            <option [ngValue]="0">Distância</option>
            <option [ngValue]="2">Até 2 km</option>
            <option [ngValue]="5">Até 5 km</option>
          </select>
          <small class="ms-auto text-secondary">{{ filtrados().length }} prestadores encontrados</small>
        </div>

        <div class="d-grid gap-3">
          @for (p of filtrados(); track p.id) {
            <div class="card-borda p-3 d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
              <div class="d-flex gap-3 flex-grow-1">
                <span class="icone-circulo"><i class="bi bi-person"></i></span>
                <div>
                  <strong class="d-block">{{ p.nome }}</strong>
                  <small class="text-secondary"><i class="bi bi-geo-alt"></i> {{ p.bairro }} • {{ p.distanciaKm | number: '1.1-1' }} km</small>
                  <div class="d-flex flex-wrap gap-1 mt-2">
                    @for (m of p.materiais; track m) {
                      <span class="tag-material" [class]="m">{{ m | material }}</span>
                    }
                  </div>
                </div>
              </div>
              <a [routerLink]="['/gerador/prestadores', p.id, 'contato']" class="btn btn-primary btn-sm">Entrar em Contato</a>
            </div>
          } @empty {
            <div class="card-borda text-center text-secondary small py-5">Nenhum prestador com esses filtros.</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class PrestadoresProximos {
  private readonly dados = inject(DadosExemploService);

  readonly materiais = MATERIAIS;
  readonly material = signal<'' | TipoMaterial>('');
  readonly distancia = signal(0);
  readonly todos = signal<Prestador[]>([]);
  readonly filtrados = computed(() =>
    this.todos().filter(
      (p) =>
        (!this.material() || p.materiais.includes(this.material() as TipoMaterial)) &&
        (!this.distancia() || p.distanciaKm <= this.distancia()),
    ),
  );

  ngOnInit(): void {
    this.dados.listarPrestadores().subscribe((l) => this.todos.set(l));
  }
}
