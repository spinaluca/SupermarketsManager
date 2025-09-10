import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
} from '@ionic/angular/standalone';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardService, DashboardStats } from '../services/dashboard/dashboard.service';
import { AdminDashboardPage } from './admin-dashboard/admin-dashboard.page';
import { ManagerDashboardPage } from './manager-dashboard/manager-dashboard.page';
import { CustomerDashboardPage } from './customer-dashboard/customer-dashboard.page';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/header/header.component';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    AdminDashboardPage,
    ManagerDashboardPage,
    CustomerDashboardPage,
    HeaderComponent,
  ]
})
export class DashboardPage {
  ruolo: 'admin' | 'manager' | 'customer' | 'null' = 'null';
  stats: DashboardStats | null = null;
  supermarkets: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ionViewWillEnter(): void {
    // Resetta lo stato per evitare lo sfarfallio dei componenti
    this.ruolo = 'null';
    this.stats = null;
    this.supermarkets = [];

    const state = window.history.state;
    if (state && state.dashboardData) {
      this.processDashboardData(state.dashboardData);
      // Pulisce lo stato per evitare di usarlo tornando indietro
      const currentState = { ...state };
      delete currentState.dashboardData;
      history.replaceState(currentState, '');
    } else {
      this.ottieniDashboard();
    }
  }

  processDashboardData(res: any): void {
    const payload = res.data;
    // Se non trova il ruolo, lo imposta come customer
    this.ruolo        = payload.user?.role ?? 'customer';
    this.stats        = payload.stats ?? null;
    this.supermarkets = payload.supermarkets ?? [];
  }

  // Ottenimento dati dashboard da API
  ottieniDashboard(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (res: any) => {
        this.processDashboardData(res);
      },
      error: () => {
        this.snackBar.open('Errore nel caricamento della Dashboard!', 'Chiudi', { duration: 3000 });
      }
    });
  }
}
