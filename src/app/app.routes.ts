import { Routes } from '@angular/router';
import { autenticadoGuard, perfilGuard, visitanteGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  // ================= Público =================
  {
    path: '',
    pathMatch: 'full',
    title: 'EcoRota — Seu reciclável encontra um novo caminho',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    title: 'Entrar — EcoRota',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'cadastro',
    title: 'Criar conta — EcoRota',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./features/auth/cadastro/cadastro').then((m) => m.Cadastro),
  },
  // A confirmação agora acontece no bot do Telegram; links antigos caem no login.
  { path: 'confirmar-telefone', redirectTo: 'login' },

  // ================= Gerador (quem descarta) =================
  {
    path: 'gerador',
    canActivate: [autenticadoGuard, perfilGuard('Gerador')],
    loadComponent: () => import('./layout/layout-app').then((m) => m.LayoutApp),
    children: [
      {
        path: '',
        title: 'Início — EcoRota',
        loadComponent: () => import('./features/gerador/home/gerador-home').then((m) => m.GeradorHome),
      },
      {
        path: 'nova-solicitacao',
        title: 'Nova solicitação — EcoRota',
        loadComponent: () =>
          import('./features/gerador/nova-solicitacao/nova-solicitacao').then((m) => m.NovaSolicitacao),
      },
      {
        path: 'solicitacao-publicada/:id',
        title: 'Solicitação publicada — EcoRota',
        loadComponent: () =>
          import('./features/gerador/nova-solicitacao/solicitacao-publicada').then((m) => m.SolicitacaoPublicada),
      },
      {
        path: 'solicitacoes',
        title: 'Minhas solicitações — EcoRota',
        loadComponent: () =>
          import('./features/gerador/solicitacoes/minhas-solicitacoes').then((m) => m.MinhasSolicitacoes),
      },
      {
        path: 'solicitacoes/:id',
        title: 'Detalhes da solicitação — EcoRota',
        loadComponent: () =>
          import('./features/gerador/solicitacoes/detalhe-solicitacao').then((m) => m.DetalheSolicitacao),
      },
      {
        path: 'prestadores',
        title: 'Prestadores próximos — EcoRota',
        loadComponent: () =>
          import('./features/gerador/prestadores/prestadores-proximos').then((m) => m.PrestadoresProximos),
      },
      {
        path: 'prestadores/:prestadorId/contato',
        title: 'Contato com o prestador — EcoRota',
        loadComponent: () =>
          import('./features/gerador/nova-solicitacao/nova-solicitacao').then((m) => m.NovaSolicitacao),
      },
      {
        path: 'pontos-descarte',
        title: 'Pontos de descarte — EcoRota',
        loadComponent: () =>
          import('./features/gerador/pontos-descarte/pontos-descarte').then((m) => m.PontosDescarte),
      },
      {
        path: 'perfil',
        title: 'Meu perfil — EcoRota',
        loadComponent: () => import('./features/perfil/meu-perfil').then((m) => m.MeuPerfil),
      },
    ],
  },

  // ================= Catador / Prestador (quem recolhe) =================
  {
    path: 'catador',
    canActivate: [autenticadoGuard, perfilGuard('Catador')],
    loadComponent: () => import('./layout/layout-app').then((m) => m.LayoutApp),
    children: [
      {
        path: '',
        title: 'Início — EcoRota',
        loadComponent: () => import('./features/catador/home/catador-home').then((m) => m.CatadorHome),
      },
      {
        path: 'pedidos',
        title: 'Pedidos próximos — EcoRota',
        data: { modo: 'proximos' },
        loadComponent: () => import('./features/catador/pedidos/pedidos-proximos').then((m) => m.PedidosProximos),
      },
      {
        path: 'coletas',
        title: 'Minhas coletas — EcoRota',
        data: { modo: 'coletas' },
        loadComponent: () => import('./features/catador/pedidos/pedidos-proximos').then((m) => m.PedidosProximos),
      },
      {
        path: 'pedidos/:id',
        title: 'Detalhes do pedido — EcoRota',
        loadComponent: () => import('./features/catador/pedidos/detalhe-pedido').then((m) => m.DetalhePedido),
      },
      {
        path: 'pedidos/:id/aceito',
        title: 'Pedido aceito — EcoRota',
        loadComponent: () => import('./features/catador/pedidos/pedido-aceito').then((m) => m.PedidoAceito),
      },
      {
        path: 'perfil',
        title: 'Meu perfil — EcoRota',
        loadComponent: () => import('./features/perfil/meu-perfil').then((m) => m.MeuPerfil),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
