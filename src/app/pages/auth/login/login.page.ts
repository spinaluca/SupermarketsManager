import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonButton, IonModal, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { IonInput } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { eye, eyeOff, shareOutline } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { filter, first, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../auth.scss'],
  standalone: true,
  imports: [IonButton, IonItem, IonContent, IonInput, IonIcon, CommonModule, FormsModule, RouterModule, IonModal]
})
export class LoginPage implements OnInit, OnDestroy {

  username: string = '';
  password: string = '';
  showIOSModal = false;
  
  errorMessage = '';

  usernameFocused: boolean = false;
  passwordFocused: boolean = false;

  private logoClickCount = 0;
  private logoClickTimeout: any;

  showApiModal = false;
  apiUrl = '';
  apiPort = 'default';
  customPort = '';
  apiSchema = 'https'; // Nuova variabile per lo schema
  showPassword = false;
  loading = false;

  constructor(
    private authService : AuthService,
    private router: Router,
    private http: HttpClient,
    private dashboardService: DashboardService
  ) { 
    addIcons({ eye, eyeOff, shareOutline });
  }


  ionViewWillEnter() {

    // Precompila i campi se arrivano da registrazione
    const nav = window.history.state;
    if (nav && nav.username) {
      this.username = nav.username;
    }
    if (nav && nav.password) {
      this.password = nav.password;
    }

    // Accesso automatico se già autenticato
    this.loading = true;
    if (this.authService.isLoggedIn()) {
      this.dashboardService.getDashboard().pipe(
        timeout(3000),
        catchError(() => {
          this.authService.logout(false);
          this.loading = false;
          return of(null); // Ritorna un observable nullo per completare la catena
        })
      ).subscribe({
        next: (data: any) => {
          if (data) {
            this.router.navigate(['/dashboard'], { replaceUrl: true, state: { dashboardData: data } });
          }
          this.loading = false;
        },
        error: () => {
          this.authService.logout(false);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  ngOnInit(): void {
    this.checkIOSDevice();
  }

  ngOnDestroy(): void {
    this.resetForm();
  }

  resetForm() {
    this.username = '';
    this.password = '';
    this.errorMessage = '';
  }

  onLogin() {
    if (!this.username) { // || !this.password
      this.showError('Inserisci username e password');
      return;
    }
    this.loading = true;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
        this.resetForm(); // Svuota il form dopo il login
        this.loading = false;
      },
      error: (error) => {
        // Mostra errore solo se è errore di password/username errati
        if (error.status === 401 && error.error && error.error.error === 'Password o username errati!') {
          this.showError('Credenziali non valide');
        }
        // Altri errori: nessun messaggio qui (gestiti da snackbar nel service)
        this.loading = false;
      }
    });
  }


  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  onLogoClick() {
    this.logoClickCount++;
    if (this.logoClickTimeout) clearTimeout(this.logoClickTimeout);
    this.logoClickTimeout = setTimeout(() => this.logoClickCount = 0, 2000);
    if (this.logoClickCount >= 5) {
      this.logoClickCount = 0;
      const current = localStorage.getItem('custom_api_base_url') || '';
      // Estrai schema, url e porta
      const schemaMatch = current.match(/^(https?):\/\//);
      this.apiSchema = schemaMatch ? schemaMatch[1] : 'https';
      this.apiUrl = current.replace(/^https?:\/\//, '').replace(/:[0-9]+$/, '');
      this.apiPort = /:([0-9]+)$/.test(current) ? current.match(/:([0-9]+)$/)?.[1] || 'default' : 'default';
      this.showApiModal = true;
    }
  }

  saveApiUrl() {
    let url = this.apiUrl.trim();
    let port = this.apiPort === 'personalizzata' ? this.customPort : this.apiPort;
    let schema = this.apiSchema || 'https';
    // Costruisci url con schema
    url = url.replace(/^https?:\/\//, '');
    url = schema + '://' + url;
    if (port && port !== 'default') {
      url = url.replace(/:[0-9]+$/, '') + ':' + port;
    } else {
      url = url.replace(/:[0-9]+$/, '');
    }
    localStorage.setItem('custom_api_base_url', url);
    localStorage.setItem('custom_api_schema', schema);
    alert('URL API aggiornato!');
    window.location.reload();
  }



  closeApiModal() { this.showApiModal = false; }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  useLocalApiUrl() {
    const url = 'http://127.0.0.1:5001';
    localStorage.setItem('custom_api_base_url', url);
    localStorage.setItem('custom_api_schema', 'http');
    alert('URL API impostato al server locale!');
    window.location.reload();
  }

  resetApiUrl() {
    localStorage.setItem('custom_api_base_url', 'https://api.st3pnymarket.mickysitiwp.it');
    localStorage.setItem('custom_api_schema', 'https');
    alert('URL API resettato al server cloud!');
    window.location.reload();
  }

  checkIOSDevice() {
    // Controlla se è Safari su iOS
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Controlla se l'app è già stata installata come PWA
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                              (window.navigator as any).standalone || 
                              document.referrer.includes('ios-app://');

    // Mostra il modale solo se è Safari su iOS e non è già installata come PWA
    if (isIOS && isSafari && !isInStandaloneMode) {
      this.showIOSModal = true;
    }
  }

  closeIOSModal() {
    this.showIOSModal = false;
  }
}
