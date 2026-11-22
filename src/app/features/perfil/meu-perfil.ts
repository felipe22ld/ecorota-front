import { Component, computed, inject } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MATERIAIS, TipoLocal, TipoMaterial } from '../../core/models/enums';
import { AuthService } from '../../core/services/auth.service';
import { SessaoService } from '../../core/services/sessao.service';
import { ErroCampo } from '../../shared/components/erro-campo';
import { SeloMock } from '../../shared/components/selo-mock';
import { Mascara } from '../../shared/directives/mascara';
import { AvisoService } from '../../shared/services/aviso.service';
import { cepValidator, formatarTelefone, telefoneValidator } from '../../shared/utils/formatos';

/**
 * Meu perfil (Gerador e Catador).
 * Nome, e-mail e telefone vêm de GET /api/auth/usuario. Endereço / região de atuação
 * e o botão "Salvar" ainda não têm endpoint.
 */
@Component({
  selector: 'app-meu-perfil',
  imports: [ReactiveFormsModule, RouterLink, ErroCampo, SeloMock, Mascara],
  templateUrl: './meu-perfil.html',
})
export class MeuPerfil {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly sessao = inject(SessaoService);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(AvisoService);

  readonly usuario = this.sessao.usuario;
  readonly ehCatador = computed(() => this.sessao.perfil() === 'Catador');
  readonly base = computed(() => (this.ehCatador() ? '/catador' : '/gerador'));
  readonly materiais = MATERIAIS;

  readonly dados = this.fb.group({
    nome: [this.usuario()?.nome ?? '', [Validators.required, Validators.minLength(3)]],
    telefone: [formatarTelefone(this.usuario()?.telefone ?? ''), [Validators.required, telefoneValidator]],
    email: [{ value: this.usuario()?.email ?? '', disabled: true }],
  });

  readonly endereco = this.fb.group({
    tipoLocal: this.fb.control<TipoLocal>('Casa'),
    cep: ['', cepValidator],
    logradouro: [''],
    numero: [''],
    complemento: [''],
    bairro: [''],
    cidade: [''],
  });

  readonly regiao = this.fb.group({
    cidade: [''],
    bairro: [''],
    materiais: new FormControl<TipoMaterial[]>([], { nonNullable: true }),
  });

  alternarMaterial(m: TipoMaterial): void {
    const c = this.regiao.controls.materiais;
    c.setValue(c.value.includes(m) ? c.value.filter((x) => x !== m) : [...c.value, m]);
  }

  salvar(): void {
    if (this.dados.invalid) {
      this.dados.markAllAsTouched();
      return;
    }
    // TODO API: PUT /api/usuarios/me (ainda não existe no back-end)
    this.avisos.info('Edição de perfil ainda não tem endpoint na API.');
  }

  sair(): void {
    this.auth.sair();
  }
}
