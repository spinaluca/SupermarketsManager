import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { SupermarketService } from '../services/supermercati/supermercati.service';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router, private supermarketService: SupermarketService, private snackBar: MatSnackBar) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const expectedRoles: string[] = route.data['roles'] ?? [];

    const user = await this.auth.getUser();
    if (!user) {
      return this.router.parseUrl('auth/login');
    }
    const role = user.role;
    

    // Controllo specifico per manager su dettaglio-supermercato e agg-prodotti-al-supermercato
    const path = route.routeConfig?.path ?? '';
    if (role === 'manager' &&
                  (path.startsWith('supermercato/:id') || path.startsWith('agg-prodotti-al-supermercato/:id'))){

      const supermarketId = Number(route.params['id']);
      const supermarkets = await firstValueFrom(this.supermarketService.getSupermercatiAssegnati());

      const allowedIds = supermarkets.map((s: any) => s.id);

      if (allowedIds.includes(supermarketId)) {
        return true;
      } else {
        this.snackBar.open('Non hai i permessi per accedere a questo supermercato', 'Chiudi', { duration: 4000 });
        return this.router.parseUrl('/dashboard');
      }

    }


    // Controllo per tutti gli altri casi
    if (!expectedRoles.includes(role)) {
      return this.router.parseUrl('/dashboard');
    }else{
      return true;
    }

  }
} 