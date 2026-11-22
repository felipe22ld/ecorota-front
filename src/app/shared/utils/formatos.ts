import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function somenteDigitos(valor: string | null | undefined): string {
  return (valor ?? '').replace(/\D/g, '');
}

/** (11) 91234-5678 */
export function formatarTelefone(valor: string): string {
  let d = somenteDigitos(valor);
  if (d.startsWith('55') && d.length > 11) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** 12345-678 */
export function formatarCep(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/**
 * Converte "(11) 91234-5678" para o formato aceito pela API: "+5511912345678".
 * (o validador do back-end usa ^\+?[1-9]\d{9,14}$)
 */
export function telefoneParaApi(valor: string): string {
  const d = somenteDigitos(valor);
  return d.startsWith('55') && d.length > 11 ? `+${d}` : `+55${d}`;
}

// ---- Validadores ----

export const telefoneValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  if (!c.value) return null;
  const n = somenteDigitos(c.value).length;
  return n === 10 || n === 11 ? null : { telefone: true };
};

export const cepValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  if (!c.value) return null;
  return somenteDigitos(c.value).length === 8 ? null : { cep: true };
};

/** Mesmas regras do back-end: 8+ caracteres, maiúscula, minúscula, número e caractere especial. */
export const senhaForteValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v: string = c.value ?? '';
  if (!v) return null;
  const ok = v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
  return ok ? null : { senhaFraca: true };
};

export const codigoValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  if (!c.value) return null;
  return /^\d{6}$/.test(c.value) ? null : { codigo: true };
};
