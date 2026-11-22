import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PerfilUsuario } from '../models/enums';
import { SessaoService } from '../services/sessao.service';

/** Só deixa entrar quem está logado. */
export const autenticadoGuard: CanActivateFn = (_route, state) => {
  const sessao = inject(SessaoService);
  const router = inject(Router);
  return sessao.autenticado()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { voltar: state.url } });
};

/** Telas de login/cadastro: quem já está logado vai direto para a sua área. */
export const visitanteGuard: CanActivateFn = () => {
  const sessao = inject(SessaoService);
  const router = inject(Router);
  if (!sessao.autenticado()) return true;
  return router.createUrlTree([sessao.perfil() === 'Catador' ? '/catador' : '/gerador']);
};

/** Restringe a área a um perfil (Catador ou Gerador). */
export function perfilGuard(perfil: PerfilUsuario): CanActivateFn {
  return () => {
    const sessao = inject(SessaoService);
    const router = inject(Router);
    if (!sessao.autenticado()) return router.createUrlTree(['/login']);
    return sessao.perfil() === perfil
      ? true
      : router.createUrlTree([sessao.perfil() === 'Catador' ? '/catador' : '/gerador']);
  };
}
