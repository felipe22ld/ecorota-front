import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { PontoDescarte, Prestador } from '../models/app.models';

/**
 * DADOS DE EXEMPLO para as telas que ainda não têm endpoint na API (prestadores e pontos de descarte).
 * Solicitações e pedidos já usam a API de verdade: veja ColetasService.
 *
 * Cada método devolve um Observable (como o HttpClient faria), então, quando o endpoint
 * existir, basta trocar o corpo do método por `this.http.get/post(...)` sem mexer nas telas.
 * Os dados ficam só na memória do navegador (somem ao recarregar a página).
 */
@Injectable({ providedIn: 'root' })
export class DadosExemploService {
  private readonly atraso = 350;


  private readonly prestadores: Prestador[] = [
    { id: 'p1', nome: 'Carlos Recicla', bairro: 'Vila Mariana', distanciaKm: 1.3, materiais: ['Papel', 'Plastico', 'Metal'], whatsapp: '5511912345678' },
    { id: 'p2', nome: 'Coleta da Ana', bairro: 'Saúde', distanciaKm: 2.1, materiais: ['Vidro', 'Papel'], whatsapp: '5511923456789' },
    { id: 'p3', nome: 'Antônio Catador', bairro: 'Aclimação', distanciaKm: 3.4, materiais: ['Plastico', 'Metal', 'Vidro'], whatsapp: '5511934567890' },
  ];

  private readonly pontos: PontoDescarte[] = [
    { id: 'd1', nome: 'Ecoponto Vila Mariana', endereco: 'Rua das Flores, 120 — Vila Mariana, São Paulo', distanciaKm: 1.3, horario: 'Aberto até 18h', telefone: '(11) 3333-4444' },
    { id: 'd2', nome: 'Estação Circular Saúde', endereco: 'Av. Jabaquara, 845 — Saúde, São Paulo', distanciaKm: 2.8, horario: 'Aberto até 17h', telefone: '(11) 98888-1234' },
    { id: 'd3', nome: 'Ponto Verde Aclimação', endereco: 'Rua Pires da Mota, 410 — Aclimação, São Paulo', distanciaKm: 4.6, horario: 'Aberto até 17h', telefone: '(11) 97777-5678' },
  ];


  // ================= Gerador =================

  // TODO API: GET /api/prestadores/proximos
  listarPrestadores(): Observable<Prestador[]> {
    return of(this.prestadores).pipe(delay(this.atraso));
  }

  obterPrestador(id: string): Observable<Prestador> {
    const p = this.prestadores.find((x) => x.id === id);
    return p ? of(p).pipe(delay(this.atraso)) : naoEncontrado();
  }

  // TODO API: GET /api/pontos-descarte
  listarPontos(): Observable<PontoDescarte[]> {
    return of(this.pontos).pipe(delay(this.atraso));
  }

}


function naoEncontrado(): Observable<never> {
  return throwError(() => new Error('Registro não encontrado.')).pipe(delay(200));
}
