import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Logo EcoRota (folha + nome). `claro` = versão para fundo verde. */
@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  template: `
    <a [routerLink]="link()" class="logo d-inline-flex align-items-center gap-2 text-decoration-none" [class.claro]="claro()">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 27c0-11 7-19 22-21-1 13-9 21-19 21H5Z" [attr.fill]="claro() ? '#ffffff' : '#3c7852'" />
        <path d="M8 25c4-6 9-10 15-14" fill="none" [attr.stroke]="claro() ? '#3c7852' : '#ffffff'" stroke-width="2" stroke-linecap="round" />
        <path d="M3 18c1-5 4-8 9-9-1 3-2 6-5 8" [attr.fill]="claro() ? '#cfe8d6' : '#2c5b3b'" />
      </svg>
      <span class="nome">EcoRota</span>
    </a>
  `,
  styles: `
    .logo .nome {
      font-weight: 700;
      font-size: 1.1rem;
      color: #3c7852;
      letter-spacing: -0.01em;
    }
    .logo.claro .nome {
      color: #ffffff;
    }
  `,
})
export class Logo {
  readonly claro = input(false);
  readonly link = input<string>('/');
}
