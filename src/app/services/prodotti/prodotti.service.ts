import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment, getApiBaseUrl } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = getApiBaseUrl();

  constructor(private http: HttpClient) {}

  // Aggiungi prodotto
  addProduct(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/add_product`, data, { headers: this.getAuthHeaders() });
  }

  // Assegna prodotto a supermercato
  addToSupermarket(supermarketId: number, data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/add_product_to_supermarket/${supermarketId}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // Aggiorna quantità e prezzo di un prodotto già presente nel supermercato
  updateProduct(supermarketId: number, productId: number, data: any): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/update_product_quantity_and_price/${supermarketId}/${productId}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('jwt_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
