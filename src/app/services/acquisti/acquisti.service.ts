import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment, getApiBaseUrl } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private baseUrl = getApiBaseUrl();

  constructor(private http: HttpClient) {}

  // Acquisto prodotto
  purchase(supermarketId: number, productId: number, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/purchase/${supermarketId}/${productId}`, data, { headers: this.getAuthHeaders() });
  }

  // Storico acquisti
  getHistory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/purchases`, { headers: this.getAuthHeaders() });
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('jwt_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
