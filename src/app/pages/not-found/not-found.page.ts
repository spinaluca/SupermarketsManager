import { Component, inject, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth/auth.service';
import { IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
    imports: [
    IonContent
  ]
})
export class NotFoundPage implements AfterViewInit {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private auth = inject(AuthService);

  ngOnInit() {
    this.snackBar.open('La pagina richiesta non esiste!!', 'Chiudi', { duration: 7000 });
    setTimeout(() => {
      this.goHome();
    }, 2000);
  }

  ngAfterViewInit() {}

  goHome() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
