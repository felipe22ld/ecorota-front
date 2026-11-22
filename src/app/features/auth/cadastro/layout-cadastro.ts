import { Component } from '@angular/core';
import { Logo } from '../../../shared/components/logo';

/** Moldura das telas de cadastro: texto à esquerda (desktop) e o card projetado à direita. */
@Component({
  selector: 'app-layout-cadastro',
  imports: [Logo],
  template: `
    <div class="bg-eco-cinza min-vh-100 d-flex flex-column">
      <header class="container py-4"><app-logo /></header>

      <main class="container flex-grow-1 d-flex align-items-center pb-5">
        <div class="row w-100 g-5 align-items-center mx-0">
          <div class="col-lg-5 d-none d-lg-block">
            <span class="eco-eyebrow">Crie sua conta</span>
            <h1 class="eco-display mb-3">Faça parte de uma rede que transforma.</h1>
            <p class="eco-subtitulo mb-4" style="max-width: 24rem">
              Leva poucos minutos. Você poderá editar suas informações depois.
            </p>
            <hr class="border-secondary-subtle opacity-100" style="max-width: 24rem" />
            <div class="d-flex gap-2 small text-secondary" style="max-width: 24rem">
              <i class="bi bi-shield-check text-eco-verde fs-5"></i>
              <span>Seus dados são protegidos e usados apenas para conectar você à rede.</span>
            </div>
          </div>

          <div class="col-lg-6 offset-lg-1 px-0 px-sm-3">
            <div class="card-eco p-4 p-md-5 mx-auto" style="max-width: 34rem">
              <ng-content />
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class LayoutCadastro {}
