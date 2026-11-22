import { Component, computed, inject, input, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  DIAS_SEMANA,
  DiaSemana,
  NovaSolicitacao as DadosSolicitacao,
  PERIODOS,
  Periodo,
  Prestador,
  TipoRetirada,
  Volume,
  rotuloPeriodo,
  rotuloRetirada,
} from '../../../core/models/app.models';
import { MATERIAIS, TipoMaterial, rotuloMaterial } from '../../../core/models/enums';
import { ColetasService } from '../../../core/services/coletas.service';
import { DadosExemploService } from '../../../core/services/dados-exemplo.service';
import { converterErro } from '../../../core/utils/erro-api';
import { SessaoService } from '../../../core/services/sessao.service';
import { ErroCampo } from '../../../shared/components/erro-campo';
import { SeloMock } from '../../../shared/components/selo-mock';
import { AvisoService } from '../../../shared/services/aviso.service';

/**
 * Nova solicitação de retirada.
 * Com :prestadorId na rota vira "Contato com o prestador" e termina no WhatsApp.
 */
@Component({
  selector: 'app-nova-solicitacao',
  imports: [ReactiveFormsModule, RouterLink, ErroCampo, SeloMock],
  templateUrl: './nova-solicitacao.html',
})
export class NovaSolicitacao {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dados = inject(DadosExemploService);
  private readonly coletas = inject(ColetasService);
  private readonly sessao = inject(SessaoService);
  private readonly router = inject(Router);
  private readonly avisos = inject(AvisoService);

  readonly prestadorId = input<string>();

  readonly materiais = MATERIAIS.map((m) => (m.valor === 'Papel' ? { ...m, rotulo: 'Papel/papelão' } : m));
  readonly dias = DIAS_SEMANA;
  readonly periodos = PERIODOS;
  readonly endereco = signal('Carregando endereço...');
  readonly hoje = new Date().toISOString().slice(0, 10);

  readonly prestador = signal<Prestador | null>(null);
  readonly modoContato = computed(() => !!this.prestadorId());
  readonly enviando = signal(false);
  readonly nomeFoto = signal<string | null>(null);

  readonly form = this.fb.group({
    material: this.fb.control<TipoMaterial | ''>('', Validators.required),
    outroMaterial: [''],
    volume: this.fb.control<Volume>('Baixo'),
    observacoes: ['', Validators.maxLength(300)],
    tipoRetirada: this.fb.control<TipoRetirada>('Unica'),
    data: [this.hoje, Validators.required],
    diasSemana: new FormControl<DiaSemana[]>([], { nonNullable: true }),
    periodo: this.fb.control<Periodo>('Manha'),
  });

  ngOnInit(): void {
    this.coletas.obterEnderecoColeta().subscribe({
      next: (e) => this.endereco.set(e),
      error: () => this.endereco.set('Não foi possível carregar o endereço do cadastro.'),
    });

    const id = this.prestadorId();
    if (id) {
      this.dados.obterPrestador(id).subscribe({
        next: (p) => this.prestador.set(p),
        error: () => this.avisos.erro('Prestador não encontrado.'),
      });
    }
  }

  // ---- Seleções ----

  escolherMaterial(m: TipoMaterial): void {
    this.form.controls.material.setValue(m);
    const outro = this.form.controls.outroMaterial;
    if (m === 'Outros') outro.setValidators([Validators.required]);
    else {
      outro.clearValidators();
      outro.setValue('');
    }
    outro.updateValueAndValidity();
  }

  escolherRetirada(tipo: TipoRetirada): void {
    const c = this.form.controls;
    c.tipoRetirada.setValue(tipo);
    if (tipo === 'Unica') {
      c.data.setValidators([Validators.required]);
      c.diasSemana.clearValidators();
    } else {
      c.data.clearValidators();
      c.diasSemana.setValidators([(ctrl) => ((ctrl.value as DiaSemana[]).length ? null : { required: true })]);
    }
    c.data.updateValueAndValidity();
    c.diasSemana.updateValueAndValidity();
  }

  alternarDia(d: DiaSemana): void {
    const ctrl = this.form.controls.diasSemana;
    ctrl.setValue(ctrl.value.includes(d) ? ctrl.value.filter((x) => x !== d) : [...ctrl.value, d]);
    ctrl.markAsTouched();
  }

  escolherFoto(evento: Event): void {
    const arquivo = (evento.target as HTMLInputElement).files?.[0];
    this.nomeFoto.set(arquivo?.name ?? null);
  }

  // ---- Envio ----

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.avisos.erro('Confira os campos destacados.');
      return;
    }

    const v = this.form.getRawValue();
    const dados: DadosSolicitacao = {
      material: v.material as TipoMaterial,
      outroMaterial: v.material === 'Outros' ? v.outroMaterial.trim() : null,
      volume: v.volume,
      observacoes: v.observacoes.trim() || null,
      tipoRetirada: v.tipoRetirada,
      data: v.tipoRetirada === 'Unica' ? v.data : null,
      diasSemana: v.tipoRetirada === 'Fixa' ? v.diasSemana : [],
      periodo: v.periodo,
      temFoto: !!this.nomeFoto(),
    };

    if (this.modoContato()) {
      this.abrirWhatsApp(dados);
      return;
    }

    this.enviando.set(true);
    this.coletas
      .criarSolicitacao(dados)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (s) => this.router.navigate(['/gerador/solicitacao-publicada', s.id]),
        error: (e) => this.avisos.erro(converterErro(e).mensagem),
      });
  }

  private abrirWhatsApp(d: DadosSolicitacao): void {
    const p = this.prestador();
    if (!p) return;
    const material = d.material === 'Outros' && d.outroMaterial ? d.outroMaterial : rotuloMaterial(d.material);
    const nome = this.sessao.usuario()?.nome ?? '';
    const texto =
      `Olá, ${p.nome}! Sou ${nome}, vi seu perfil na EcoRota.\n` +
      `Tenho ${material.toLowerCase()} (volume ${d.volume.toLowerCase()}) para retirada.\n` +
      `Local: ${this.endereco()}\n` +
      `${rotuloRetirada(d)}` +
      (d.observacoes ? `\nObs.: ${d.observacoes}` : '');
    window.open(`https://wa.me/${p.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  }

  rotuloPeriodo(p: Periodo): string {
    return rotuloPeriodo(p);
  }
}
