import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../shared/components/logo';

@Component({
  selector: 'app-rodape',
  imports: [RouterLink, Logo],
  template: `
    <footer class="bg-eco-claro pt-5 pb-4">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-6">
            <app-logo />
            <p class="mt-4 mb-0" style="max-width: 22rem">
              Conectando pessoas para transformar resíduos em novas possibilidades.
            </p>
          </div>
          <div class="col-6 col-lg-3">
            <h2 class="h6 small fw-normal mb-3">Plataforma</h2>
            <ul class="list-unstyled small d-grid gap-2 mb-0">
              <li><a routerLink="/" fragment="como-funciona" class="link-rodape">Como funciona</a></li>
              <li><a routerLink="/cadastro" [queryParams]="{ perfil: 'Gerador' }" class="link-rodape">Para geradores</a></li>
              <li><a routerLink="/cadastro" [queryParams]="{ perfil: 'Catador' }" class="link-rodape">Para catadores</a></li>
            </ul>
          </div>
          <div class="col-6 col-lg-3">
            <h2 class="h6 small fw-normal mb-3">Ajuda</h2>
            <ul class="list-unstyled small d-grid gap-2 mb-0">
              <li><a href="#" class="link-rodape">Contato</a></li>
              <li><a href="#" class="link-rodape">Privacidade</a></li>
              <li><a href="#" class="link-rodape">Termos de uso</a></li>
            </ul>
          </div>
        </div>
        <div class="d-flex flex-column flex-md-row justify-content-between gap-2 small mt-5">
          <span>© 2026 EcoRota. Todos os direitos reservados.</span>
          <span>Feito para uma economia mais circular.</span>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .link-rodape {
      color: #1b1b1b;
      font-weight: 400;
    }
  `,
})
export class Rodape {}
