import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { environment, getApiBaseUrl } from '../../../environments/environment';

export interface Utente {
  id: number;
  username: string;
  role: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class UtentiService {
  private baseUrl = getApiBaseUrl();

  constructor(private http: HttpClient) {}

  getAll(): Observable<Utente[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.baseUrl}/dashboard`, { headers }).pipe(
      map((res: any) => res.data?.users ?? [])
    );
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('jwt_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getManagers(): Observable<Utente[]> {
    return this.getAll().pipe(
      map(users => users.filter(u => u.role && u.role.toLowerCase() === 'manager'))
    );
  }
} 