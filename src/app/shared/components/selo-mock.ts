import { Component } from '@angular/core';

/** Selo indicando que a tela usa dados de exemplo (ainda sem endpoint na API). */
@Component({
  selector: 'app-selo-mock',
  template: `<span class="selo-mock" title="Esta tela ainda não tem endpoint na API: os dados são de exemplo."><i class="bi bi-cone-striped"></i> Dados de exemplo</span>`,
})
export class SeloMock {}
