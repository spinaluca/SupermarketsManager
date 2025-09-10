import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { AdminDashCardComponent } from '../../util/card/admin-dash-card/admin-dash-card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MatCardModule,
    MatIconModule,
    MatGridListModule,
    AdminDashCardComponent,
  ]
})
export class AdminDashboardPage {

  @Input() stats: { supermarket_count: number; product_count: number; user_count: number } | null = null;

  constructor(
    private router: Router,
  ) {}

  goSupermercati(): void {
    this.router.navigate(['/lista-supermercati']);
  }

  goProdotti(): void {
    this.router.navigate(['/prodotti']);
  }

  goUtenti(): void {
    this.router.navigate(['/utenti']);
  }
}
