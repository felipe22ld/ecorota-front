import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ErroApi, ProblemDetails } from '../models/problem-details';

// "Endereco.Cep" -> "endereco.cep" (os nomes vêm do FluentValidation em PascalCase)
function paraCamelCase(caminho: string): string {
  return caminho
    .split('.')
    .map((p) => (p ? p.charAt(0).toLowerCase() + p.slice(1) : p))
    .join('.');
}

export function converterErro(erro: unknown): ErroApi {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) {
      return {
        status: 0,
        mensagem: 'Não foi possível falar com a API. Ela está rodando em http://localhost:5134?',
        campos: {},
      };
    }

    const corpo = (typeof erro.error === 'string' ? tentarJson(erro.error) : erro.error) as
      | ProblemDetails
      | null;

    const campos: Record<string, string[]> = {};
    if (corpo?.errors) {
      for (const [chave, mensagens] of Object.entries(corpo.errors)) {
        campos[paraCamelCase(chave)] = mensagens;
      }
    }

    return {
      status: erro.status,
      mensagem: corpo?.detail || corpo?.title || mensagemPadrao(erro.status),
      campos,
      codigo: corpo?.codigo,
      linkConfirmacaoTelegram: corpo?.linkConfirmacaoTelegram,
    };
  }

  return { status: -1, mensagem: 'Ocorreu um erro inesperado.', campos: {} };
}

function tentarJson(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

function mensagemPadrao(status: number): string {
  switch (status) {
    case 400:
      return 'Requisição inválida.';
    case 401:
      return 'Não autenticado.';
    case 403:
      return 'Acesso negado.';
    case 404:
      return 'Recurso não encontrado.';
    case 409:
      return 'Registro já existe.';
    case 422:
      return 'Um ou mais campos estão inválidos.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}

/**
 * Coloca os erros de validação da API (422) dentro dos controles do formulário,
 * para aparecerem embaixo de cada campo. Ex.: "endereco.cep" -> form.get('endereco.cep').
 */
export function aplicarErrosNoFormulario(form: FormGroup, erro: ErroApi): void {
  for (const [caminho, mensagens] of Object.entries(erro.campos)) {
    const controle: AbstractControl | null = form.get(caminho);
    if (controle) {
      controle.setErrors({ ...(controle.errors ?? {}), api: mensagens[0] });
      controle.markAsTouched();
    }
  }
}
