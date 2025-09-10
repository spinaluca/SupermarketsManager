import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment, getApiBaseUrl } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupermarketService {
  private baseUrl = getApiBaseUrl() + '/api';

  constructor(private http: HttpClient) {}

  // Tutti i lista-supermercati
  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}/supermarkets`, { headers: this.getAuthHeaders() });
  }

  // Un singolo supermercato
  getOne(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/supermarkets/${id}`, { headers: this.getAuthHeaders() });
  }

  // Prodotti di un supermercato
  getProducts(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/supermarkets/${id}/products`, { headers: this.getAuthHeaders() });
  }

  // Aggiungi supermercato
  add(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add_supermarket`, data, { headers: this.getAuthHeaders() });
  }

  // Recupera tutti i prodotti disponibili nel database
  getAllProducts(): Observable<any[]> {
    const url = getApiBaseUrl() + '/dashboard';
    return this.http.get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(map(res => res.data.products ?? []));
  }
  
  // Restituisce la quantità attuale di un prodotto in un supermercato
  getProductQuantity(supermarketId: number, productId: number): Observable<number> {
    return this.getProducts(supermarketId).pipe(
      map((res: any) => {
        const prodotti = res.products || res.data?.products || [];
        const prodotto = prodotti.find((p: any) => p.id === productId);
        return prodotto ? Number(prodotto.quantity) : 0;
      })
    );
  }

  // Supermercati gestiti dal manager loggato
  getSupermercatiAssegnati(): Observable<any[]> {
    // /dashboard restituisce solo i supermercati gestiti dal manager se il ruolo è manager
    const url = getApiBaseUrl() + '/dashboard';
    return this.http.get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(map(res => res.data?.supermarkets ?? []));
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('jwt_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
