import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, Subject } from 'rxjs';
import { SupermarketService } from '../supermercati/supermercati.service';
import { environment, getApiBaseUrl } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private baseUrl = getApiBaseUrl();

  constructor(
    private http: HttpClient,
    private supermarketService: SupermarketService
  ) {}

  // Offerte per supermercato
  getOffers(supermarketId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/offers/${supermarketId}`, { headers: this.getAuthHeaders() });
  }

  // Genera offerte automatiche
  generate(supermarketId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/generate_offers/${supermarketId}`, {}, { headers: this.getAuthHeaders() });
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('jwt_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }


  // Recupera tutte le offerte di tutti i supermercati
  async loadOfferte(): Promise<any[]> {

    const { supermarkets = [] } = await firstValueFrom(this.supermarketService.getAll());

    // Per ogni supermercato, crea una Promise che recupera le sue offerte e i suoi prodotti
    const offerPromises = supermarkets.map(async (sm: any) => {
      // Recupera offerte
      const res = await firstValueFrom(this.getOffers(sm.id));
      // Recupera prodotti del supermercato
      const productsRes = await firstValueFrom(this.supermarketService.getProducts(sm.id));
      const products = productsRes.products ?? [];
      // Per ogni offerta, aggiunge il nome del supermercato e la quantità
      return (res.data?.offers ?? []).map((offer: any) => {
        const prod = products.find((p: any) => p.id === offer.product_id);
        return {
          ...offer,
          supermarket_name: sm.name,
          supermarket_id: sm.id,
          quantity: prod ? prod.quantity : undefined
        };
      });
    });

    // Esegue tutte le richieste in parallelo e ottiene un array di array di offerte
    const offersBySupermarket = await Promise.all(offerPromises);

    // Unisce tutti gli array di offerte in un unico array piatto
    return offersBySupermarket.flat();
  }

  /**
   * Restituisce uno stream di offerte che vengono emesse man mano che arrivano dai supermercati
   */
  loadOfferteStream(): Observable<any> {
    const subject = new Subject<any>();
    (async () => {
      const { supermarkets = [] } = await firstValueFrom(this.supermarketService.getAll());
      for (const sm of supermarkets) {
        try {
          const res = await firstValueFrom(this.getOffers(sm.id));
          const productsRes = await firstValueFrom(this.supermarketService.getProducts(sm.id));
          const products = productsRes.products ?? [];
          const offerte = (res.data?.offers ?? []).map((offer: any) => {
            const prod = products.find((p: any) => p.id === offer.product_id);
            return {
              ...offer,
              supermarket_name: sm.name,
              supermarket_id: sm.id,
              quantity: prod ? prod.quantity : undefined
            };
          });
          offerte.forEach((o: any) => subject.next(o));
        } catch (e) {
          // Puoi gestire errori specifici qui se vuoi
        }
      }
      subject.complete();
    })();
    return subject.asObservable();
  }
}
