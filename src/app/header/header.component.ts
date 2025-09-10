import { Component, OnInit, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule, RouterModule]
})
export class HeaderComponent implements OnInit {
  @Input() pageTitle: string | null = null;
  @Input() showBack = false;
  @Input() backUrl: string | null = null;

  userRole: string | null = null;
  userName: string | null = null;
  
  private authSub: Subscription | null = null;

  get isCustomer(): boolean {
    return this.userRole === 'customer';
  }

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.aggiornaUtente();
    this.authSub = this.authService.isAuthenticated$.subscribe(async (isAuth) => {
      await this.aggiornaUtente();
    });
  }

  async aggiornaUtente() {
    this.userRole = await this.authService.getUserRole();
    const user = await this.authService.getUser(true); // force refresh
    this.userName = user ? user.username : null;
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  goBack(): void {
    if (this.backUrl) {
      this.router.navigateByUrl(this.backUrl);
    } else {
      window.history.back();
    }
  }

  logout() {
    this.authService.logout();
  }

  goToCarrello() {
    this.router.navigate(['/carrello']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToStoricoAcquisti() {
    this.router.navigate(['/storico-acquisti']);
  }

  goToSupermercati() {
    this.router.navigate(['/lista-supermercati']);
  }

  goToAdminProdotti() {
    this.router.navigate(['/prodotti']);
  }

  goToAdminUtenti() {
    this.router.navigate(['/utenti']);
  }
  goToNotFound() {
    this.router.navigate(['/not-found']);
  }
}