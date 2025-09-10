import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { getApiBaseUrl } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
 
interface LoginResponse {
  user?: any;
  data?: {
    email?: string;
    full_name?: string;
    id?: number;
    password?: string;
    role?: string;
    username?: string;
  };
  message?: string;
  status?: string;
}
 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = getApiBaseUrl() + '/api';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
 
  constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {}

  private hasValidToken(): boolean {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload || !payload.exp) return false;
      // exp in secondi, Date.now() in ms
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }
 
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        const isSuccess = (response as any).message === 'Login effettuato con successo';
        if (isSuccess && (response as any).token) {
          localStorage.setItem('jwt_token', (response as any).token);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Se errore 401 e messaggio "Password o username errati!", propaga l'errore senza snackbar
        if (error.status === 401 && error.error && error.error.error === 'Password o username errati!') {
          this.isAuthenticatedSubject.next(false);
          return throwError(() => error);
        } else {
          // Altri errori: snackbar
          this.snackBar.open('Errore nel Login!!', 'Chiudi', { duration: 3000 });
          this.isAuthenticatedSubject.next(false);
          return throwError(() => error);
        }
      })
    );
  }
 
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }
 
  logout(showSnackbar = true): void {
    localStorage.removeItem('jwt_token');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
    if (showSnackbar) {
      this.snackBar.open('Logout effettuato con successo!', 'Chiudi', { duration: 1000 });
    }
  }

  isLoggedIn(): boolean {
    const valid = this.hasValidToken();
    if (!valid && localStorage.getItem('jwt_token')) {
      this.logout(false);
    }
    return valid;
  }


  private userCache: any = null;
  async getUser(forceRefresh = false): Promise<any> {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('jwt_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  async isAdmin(): Promise<boolean> {
    const user = await this.getUser();
    return user && user.role === 'admin';
  }

  async isCustomer(): Promise<boolean> {
    const user = await this.getUser();
    return user && user.role === 'customer';
  }

  async isManager(): Promise<boolean> {
    const user = await this.getUser();
    return user && user.role === 'manager';
  }

  async getUserRole(): Promise<string | null> {
    const user = await this.getUser();
    return user ? user.role ?? null : null;
  }
}
