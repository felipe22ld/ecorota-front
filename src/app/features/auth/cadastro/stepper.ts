import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stepper',
  template: `
    <div class="stepper mb-4">
      <div class="stepper-topo">
        <span>Etapa {{ etapa() }} de 4</span>
        <strong>{{ titulo() }}</strong>
      </div>
      <div class="stepper-barras">
        @for (n of [1, 2, 3, 4]; track n) {
          <span [class.feito]="n <= etapa()"></span>
        }
      </div>
    </div>
  `,
})
export class Stepper {
  readonly etapa = input.required<number>();
  readonly titulo = input.required<string>();
}
