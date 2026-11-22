import { HttpClient } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { CadastroResponse } from '../../../core/models/cadastro.models';
import { MATERIAIS, PerfilUsuario, TipoLocal, TipoMaterial } from '../../../core/models/enums';
import { AuthService } from '../../../core/services/auth.service';
import { SessaoService } from '../../../core/services/sessao.service';
import { ErroApi } from '../../../core/models/problem-details';
import { aplicarErrosNoFormulario, converterErro } from '../../../core/utils/erro-api';
import { ErroCampo } from '../../../shared/components/erro-campo';
import { Mascara } from '../../../shared/directives/mascara';
import { AvisoService } from '../../../shared/services/aviso.service';
import {
  cepValidator,
  senhaForteValidator,
  somenteDigitos,
  telefoneParaApi,
  telefoneValidator,
} from '../../../shared/utils/formatos';
import { ConfirmarTelegram } from './confirmar-telegram';
import { LayoutCadastro } from './layout-cadastro';
import { Stepper } from './stepper';

type Etapa = 1 | 2 | 3 | 4 | 5; // 5 = sucesso

const CAMPOS_BASICOS = ['nome', 'email', 'telefone', 'senha'];

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink, LayoutCadastro, Stepper, ErroCampo, Mascara, ConfirmarTelegram],
  templateUrl: './cadastro.html',
})
export class Cadastro {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly sessao = inject(SessaoService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly avisos = inject(AvisoService);

  /** ?perfil=Gerador | Catador (vem dos botões da landing) */
  readonly perfilInicial = input<string | undefined>(undefined, { alias: 'perfil' });

  readonly materiais = MATERIAIS;
  readonly etapa = signal<Etapa>(1);
  readonly perfil = signal<PerfilUsuario | null>(null);
  readonly enviando = signal(false);
  readonly entrando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly buscandoCep = signal(false);
  readonly verSenha = signal(false);
  readonly cadastro = signal<CadastroResponse | null>(null);

  // ---- Etapa 2 ----
  readonly basico = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    telefone: ['', [Validators.required, telefoneValidator]],
    senha: ['', [Validators.required, senhaForteValidator]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
  });

  // ---- Etapa 3: Gerador ----
  readonly gerador = this.fb.group({
    tipoLocal: this.fb.control<TipoLocal>('Casa'),
    nomeEstabelecimento: [''],
    endereco: this.fb.group({
      cep: ['', [Validators.required, cepValidator]],
      logradouro: ['', [Validators.required, Validators.maxLength(200)]],
      numero: ['', [Validators.required, Validators.maxLength(20)]],
      complemento: ['', Validators.maxLength(200)],
      bairro: ['', [Validators.required, Validators.maxLength(100)]],
      cidade: ['', [Validators.required, Validators.maxLength(100)]],
    }),
  });

  // ---- Etapa 3: Catador ----
  readonly catador = this.fb.group({
    cidade: ['', [Validators.required, Validators.maxLength(100)]],
    bairro: ['', [Validators.required, Validators.maxLength(100)]],
    materiais: new FormControl<TipoMaterial[]>([], {
      nonNullable: true,
      validators: (c) => ((c.value as TipoMaterial[]).length ? null : { materiais: true }),
    }),
    outrosMateriais: [''],
  });

  ngOnInit(): void {
    const p = this.perfilInicial();
    if (p === 'Gerador' || p === 'Catador') this.perfil.set(p);
  }

  // ================= Navegação =================

  irPara(etapa: Etapa): void {
    this.erro.set(null);
    this.etapa.set(etapa);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  continuarEtapa1(): void {
    if (this.perfil()) this.irPara(2);
  }

  continuarEtapa2(): void {
    if (this.basico.invalid) {
      this.basico.markAllAsTouched();
      return;
    }
    this.irPara(3);
  }

  // ================= Etapa 3 — Gerador =================

  escolherTipoLocal(tipo: TipoLocal): void {
    const ctrl = this.gerador.controls.nomeEstabelecimento;
    this.gerador.controls.tipoLocal.setValue(tipo);
    if (tipo === 'Comercio') {
      ctrl.setValidators([Validators.required]);
    } else {
      ctrl.clearValidators();
      ctrl.setValue('');
    }
    ctrl.updateValueAndValidity();
  }

  /** Preenche rua/bairro/cidade pelo CEP (ViaCEP, serviço público). */
  buscarCep(): void {
    const cep = somenteDigitos(this.gerador.controls.endereco.controls.cep.value);
    if (cep.length !== 8) return;

    this.buscandoCep.set(true);
    this.http
      .get<{ logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean }>(
        `https://viacep.com.br/ws/${cep}/json/`,
      )
      .pipe(finalize(() => this.buscandoCep.set(false)))
      .subscribe({
        next: (r) => {
          if (r.erro) return;
          const e = this.gerador.controls.endereco.controls;
          if (r.logradouro) e.logradouro.setValue(r.logradouro);
          if (r.bairro) e.bairro.setValue(r.bairro);
          if (r.localidade) e.cidade.setValue(r.uf ? `${r.localidade} - ${r.uf}` : r.localidade);
        },
        error: () => {
          /* sem internet ou CEP inexistente: o usuário preenche à mão */
        },
      });
  }

  // ================= Etapa 3 — Catador =================

  alternarMaterial(m: TipoMaterial): void {
    const ctrl = this.catador.controls.materiais;
    const atual = ctrl.value;
    ctrl.setValue(atual.includes(m) ? atual.filter((x) => x !== m) : [...atual, m]);
    ctrl.markAsTouched();

    const outros = this.catador.controls.outrosMateriais;
    if (ctrl.value.includes('Outros')) {
      outros.setValidators([Validators.required]);
    } else {
      outros.clearValidators();
      outros.setValue('');
    }
    outros.updateValueAndValidity();
  }

  temMaterial(m: TipoMaterial): boolean {
    return this.catador.controls.materiais.value.includes(m);
  }

  // ================= Envio para a API =================

  enviarCadastro(): void {
    this.erro.set(null);
    const form = this.perfil() === 'Catador' ? this.catador : this.gerador;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const b = this.basico.getRawValue();
    const comum = {
      nome: b.nome.trim(),
      email: b.email.trim(),
      telefone: telefoneParaApi(b.telefone),
      senha: b.senha,
    };

    let requisicao: Observable<CadastroResponse>;
    if (this.perfil() === 'Catador') {
      const c = this.catador.getRawValue();
      requisicao = this.auth.cadastrarCatador({
        ...comum,
        cidade: c.cidade.trim(),
        bairro: c.bairro.trim(),
        materiais: c.materiais,
        outrosMateriais: c.materiais.includes('Outros') ? c.outrosMateriais.trim() : null,
      });
    } else {
      const g = this.gerador.getRawValue();
      requisicao = this.auth.cadastrarGerador({
        ...comum,
        tipoLocal: g.tipoLocal,
        nomeEstabelecimento: g.tipoLocal === 'Comercio' ? g.nomeEstabelecimento.trim() : null,
        endereco: { ...g.endereco, complemento: g.endereco.complemento || null },
      });
    }

    this.enviando.set(true);
    requisicao.pipe(finalize(() => this.enviando.set(false))).subscribe({
      next: (resposta) => {
        this.cadastro.set(resposta);
        this.avisos.sucesso(resposta.mensagem);
        this.irPara(4);
      },
      error: (e) => this.tratarErroCadastro(converterErro(e)),
    });
  }

  /** Erros nos dados básicos (e-mail/telefone duplicado, senha...) voltam para a etapa 2. */
  private tratarErroCadastro(erro: ErroApi): void {
    let campos = erro.campos;

    // 409 vem sem "errors": descobrimos o campo pela mensagem.
    if (erro.status === 409) {
      const msg = erro.mensagem.toLowerCase();
      if (msg.includes('e-mail')) campos = { email: [erro.mensagem] };
      else if (msg.includes('telefone')) campos = { telefone: [erro.mensagem] };
    }

    const erroBasico = Object.keys(campos).some((c) => CAMPOS_BASICOS.includes(c));
    if (erroBasico) {
      aplicarErrosNoFormulario(this.basico, { ...erro, campos });
      this.etapa.set(2);
    } else {
      aplicarErrosNoFormulario(this.perfil() === 'Catador' ? this.catador : this.gerador, erro);
    }
    this.erro.set(erro.mensagem);
  }

  // ================= Depois da confirmação =================

  telefoneConfirmado(): void {
    this.irPara(5);
  }

  /** A etapa 4 já fez o login; se a sessão sumiu por algum motivo, entra de novo com os dados do cadastro. */
  irParaInicio(): void {
    if (this.sessao.autenticado()) {
      this.router.navigateByUrl(this.auth.rotaInicial());
      return;
    }

    const { telefone, senha } = this.basico.getRawValue();
    const telefoneApi = telefoneParaApi(telefone);
    this.entrando.set(true);
    this.auth
      .login({ telefone: telefoneApi, senha })
      .pipe(finalize(() => this.entrando.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.auth.rotaInicial()),
        error: () => this.router.navigate(['/login'], { queryParams: { telefone: telefoneApi } }),
      });
  }
}
