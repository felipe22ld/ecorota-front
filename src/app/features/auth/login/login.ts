import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { aplicarErrosNoFormulario, converterErro } from '../../../core/utils/erro-api';
import { Logo } from '../../../shared/components/logo';
import { ErroCampo } from '../../../shared/components/erro-campo';
import { Mascara } from '../../../shared/directives/mascara';
import { AvisoService } from '../../../shared/services/aviso.service';
import { formatarTelefone, telefoneParaApi, telefoneValidator } from '../../../shared/utils/formatos';

type Modo = 'telefone' | 'email';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Logo, ErroCampo, Mascara],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly avisos = inject(AvisoService);

  // Query params (withComponentInputBinding)
  readonly voltar = input<string>();
  readonly expirou = input<string>();
  /** ?telefone= para já vir preenchido (ex.: depois do cadastro) */
  readonly telefone = input<string>();

  readonly modo = signal<Modo>('telefone');
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  /** Preenchido quando o login volta 403 com telefone não confirmado: é o "reenviar" do fluxo do Telegram. */
  readonly linkTelegram = signal<string | null>(null);
  readonly verSenha = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', [Validators.required, telefoneValidator]],
    senha: ['', Validators.required],
    lembrar: [true],
  });

  ngOnInit(): void {
    const telefone = this.telefone();
    if (telefone) this.form.controls.telefone.setValue(formatarTelefone(telefone));
  }

  trocarModo(modo: Modo): void {
    this.modo.set(modo);
    this.erro.set(null);
  }

  get podeEnviar(): boolean {
    const c = this.form.controls;
    const identificador = this.modo() === 'email' ? c.email : c.telefone;
    return identificador.valid && c.senha.valid && !this.enviando();
  }

  entrar(): void {
    this.erro.set(null);
    this.linkTelegram.set(null);

    if (this.modo() === 'email') {
      // A API autentica pelo telefone (LoginRequest = Telefone + Senha); a aba E-mail fica só no visual do Figma.
      this.erro.set('O login agora é pelo telefone. Use a aba Telefone.');
      return;
    }

    if (!this.podeEnviar) {
      this.form.markAllAsTouched();
      return;
    }

    const { telefone, senha } = this.form.getRawValue();
    this.enviando.set(true);

    this.auth
      .login({ telefone: telefoneParaApi(telefone), senha })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (resposta) => {
          this.avisos.sucesso(`Bem-vindo(a), ${resposta.usuario.nome.split(' ')[0]}!`);
          const destino = this.voltar() || this.auth.rotaInicial();
          this.router.navigateByUrl(destino);
        },
        error: (e) => {
          const erro = converterErro(e);
          aplicarErrosNoFormulario(this.form, erro);
          this.erro.set(erro.mensagem);
          if (erro.codigo === 'telefone_nao_confirmado') {
            this.linkTelegram.set(erro.linkConfirmacaoTelegram ?? null);
          }
        },
      });
  }

  esqueciSenha(): void {
    this.avisos.info('Recuperação de senha ainda não tem endpoint na API.');
  }
}
