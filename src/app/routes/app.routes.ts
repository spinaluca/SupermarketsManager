import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'home',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('../pages/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'auth/registrazione',
    loadComponent: () => import('../pages/auth/registrazione/registrazione.page').then(m => m.RegistrazionePage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('../dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'lista-supermercati',
    loadComponent: () => import('../pages/common/lista-supermercati/lista-supermercati-page.component').then(m => m.ListaSupermercatiPage),
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'manager'] }
  },
  {
    path: 'agg-prodotti-al-supermercato/:id',
    loadComponent: () => import('../pages/common/agg-prodotti-al-supermercato/agg-prodotti-al-supermercato-page.component').then(m => m.AggProdottiAlSupermercatoPage),
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'manager'] }
  },
  {
    path: 'prodotti',
    loadComponent: () => import('../pages/admin/prodotti/prodotti.page').then(m => m.ProdottiPage),
    canActivate: [RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'utenti',
    loadComponent: () => import('../pages/admin/utenti/utenti.page').then(m => m.UtentiPage),
    canActivate: [RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'supermercato/:id',
    loadComponent: () => import('../pages/common/dettaglio-supermercato/dettaglio-supermercato-page.component').then(m => m.DettaglioSupermercatoPage),
    canActivate: [RoleGuard],
    data: { roles: ['customer', 'manager', 'admin'] }
  },
  {
    path: 'carrello',
    loadComponent: () => import('../pages/customer/carrello/carrello.page').then(m => m.CarrelloPage),
    canActivate: [RoleGuard],
    data: { roles: ['customer'] }
  },
  {
    path: 'storico-acquisti',
    loadComponent: () => import('../pages/customer/storico-acquisti/storico-acquisti.page').then(m => m.StoricoAcquistiPage),
    canActivate: [RoleGuard],
    data: { roles: ['customer'] }
  },
  {
    path: '**',
    loadComponent: () => import('../pages/not-found/not-found.page').then(m => m.NotFoundPage)
  },
];
