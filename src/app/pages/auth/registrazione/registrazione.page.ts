import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonButton, IonInput, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

@Component({
  selector: 'app-registrazione',
  templateUrl: './registrazione.page.html',
  styleUrls: ['../auth.scss'],
  standalone: true,
  imports: [IonInput, IonItem, IonContent, IonButton, IonIcon, CommonModule, FormsModule, RouterModule]
})
export class RegistrazionePage implements OnInit, OnDestroy {

  focused = {
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    role: false
  };

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = 'customer';
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    addIcons({ eye, eyeOff });
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.resetForm();
  }

  resetForm() {
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.role = 'customer';
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.showError('Compila tutti i campi');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showError('Le password non coincidono');
      return;
    }


    // Validazione password
    if (this.password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(this.password)) {
      this.showError('La password deve contenere almeno 8 caratteri e almeno un carattere speciale');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.showError('Formato email non valido');
      return ;
    }

    const data = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role
    };

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.authService.register(data).subscribe({
      next: () => {
        this.errorMessage = '';
        // Passa username e password come stato di navigazione
        this.router.navigate(['/auth/login'], {
          state: { username: this.username, password: this.password }
        });
        this.resetForm();
        this.snackBar.open('Registrazione completata!! Effettua il login.', 'Chiudi', { duration: 3000 });
      },
      error: (error) => {
        if (error.error.error === 'Username già presente!') {
          this.showError('Username già esistente');
        } else {
          this.showError('Errore durante la registrazione');
        }
      }
    });
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
