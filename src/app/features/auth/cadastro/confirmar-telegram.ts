import { Component, inject, input, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { converterErro } from '../../../core/utils/erro-api';
import { telefoneParaApi } from '../../../shared/utils/formatos';

/**
 * Etapa 4: o usuário abre o bot do EcoRota no Telegram e compartilha o número.
 * Não há código para digitar — "Já confirmei" tenta o login; se a API ainda
 * responder 403 (telefone_nao_confirmado), mostramos o link de novo.
 */
@Component({
  selector: 'app-confirmar-telegram',
  template: `
    <div class="text-center">
      <span class="icone-circulo redondo mb-3"><i class="bi bi-telegram"></i></span>
      <h2 class="h3 fw-normal mb-2">Confirme seu telefone no Telegram</h2>
      <p class="small text-secondary mb-4">
        Abra o bot do EcoRota, toque em <strong class="text-body">Iniciar</strong> e depois em
        <strong class="text-body">Compartilhar meu número</strong>.
        @if (telefone()) {
          <br />O número do Telegram precisa ser o mesmo do cadastro:
          <strong class="text-body">{{ telefone() }}</strong>
        }
      </p>

      <div class="d-grid gap-2 mx-auto" style="max-width: 18rem">
        <a class="btn btn-eco-escuro" [href]="linkAtual()" target="_blank" rel="noopener" (click)="abriu.set(true)">
          <i class="bi bi-telegram me-1"></i>
          {{ abriu() ? 'Abrir o Telegram de novo' : 'Abrir o Telegram' }}
        </a>

        <button type="button" class="btn btn-outline-secondary" [disabled]="verificando()" (click)="verificar()">
          @if (verificando()) {
            <span class="spinner-border spinner-border-sm me-2"></span> Verificando...
          } @else {
            Já confirmei, entrar
          }
        </button>
      </div>

      @if (erro()) {
        <div class="alert alert-warning small py-2 mt-3 text-start" role="alert">{{ erro() }}</div>
      }

      <p class="small text-secondary mt-4 mb-0">
        <i class="bi bi-info-circle"></i>
        Fechou o Telegram sem confirmar? Sem problema: o link continua valendo, e ele também aparece ao tentar entrar.
      </p>
    </div>
  `,
})
export class ConfirmarTelegram {
  private readonly auth = inject(AuthService);

  readonly link = input.required<string>();
  readonly telefone = input.required<string>();
  readonly senha = input.required<string>();
  /** Emitido depois do login bem-sucedido (sessão já iniciada). */
  readonly confirmado = output<void>();

  readonly abriu = signal(false);
  readonly verificando = signal(false);
  readonly erro = signal<string | null>(null);
  private readonly linkDaApi = signal<string | null>(null);

  linkAtual(): string {
    return this.linkDaApi() ?? this.link();
  }

  verificar(): void {
    this.erro.set(null);
    this.verificando.set(true);
    this.auth
      .login({ telefone: telefoneParaApi(this.telefone()), senha: this.senha() })
      .pipe(finalize(() => this.verificando.set(false)))
      .subscribe({
        next: () => this.confirmado.emit(),
        error: (e) => {
          const erro = converterErro(e);
          if (erro.codigo === 'telefone_nao_confirmado') {
            if (erro.linkConfirmacaoTelegram) this.linkDaApi.set(erro.linkConfirmacaoTelegram);
            this.erro.set(
              'Ainda não recebemos sua confirmação. Abra o Telegram, compartilhe seu número e tente de novo.',
            );
          } else {
            this.erro.set(erro.mensagem);
          }
        },
      });
  }
}
