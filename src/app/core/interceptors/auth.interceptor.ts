import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessaoService } from '../services/sessao.service';

/** A requisição é para a API do EcoRota? (não envia o token para serviços de fora, como o ViaCEP) */
function ehDaApi(url: string): boolean {
  return url.startsWith(`${environment.apiUrl}/api/`) || url.startsWith('/api/');
}

/** Envia "Authorization: Bearer {token}" e derruba a sessão se a API responder 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessao = inject(SessaoService);
  const router = inject(Router);
  const token = sessao.token();
  const daApi = ehDaApi(req.url);

  const requisicao =
    token && daApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      const ehLogin = req.url.includes('/api/auth/login');
      if (daApi && erro instanceof HttpErrorResponse && erro.status === 401 && token && !ehLogin) {
        sessao.encerrar();
        router.navigate(['/login'], { queryParams: { expirou: 1 } });
      }
      return throwError(() => erro);
    }),
  );
};
