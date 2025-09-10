import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../services/prodotti/prodotti.service';
import { OfferService } from '../../../services/offerte/offerte.service';
import { HeaderComponent } from '../../../header/header.component';
import { SupermarketService } from '../../../services/supermercati/supermercati.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-agg-prodotti-al-supermercato',
  templateUrl: './agg-prodotti-al-supermercato-page.component.html',
  styleUrls: ['./agg-prodotti-al-supermercato-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    HeaderComponent,
    MatIconModule
  ]
})
export class AggProdottiAlSupermercatoPage implements OnInit {
  supermarketId!: number;
  products: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private supermarketService: SupermarketService,
    private offerService: OfferService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.supermarketId = id;
    this.loadProdottiOfferte();
  }

  private loadProdottiOfferte(): void {
    this.supermarketService.getAllProducts().subscribe({ // recupero tutti i prodotti nel DB
      next: (products: any[]) => {
        // Recupero i prodotti assegnati al supermercato
        this.supermarketService.getProducts(this.supermarketId).subscribe({
          next: (assignedRes: any) => {
            const assignedProducts = assignedRes.products || [];
            const assignedProductIds = new Set<number>(assignedProducts.map((ap: any) => ap.id));
            // Recupero le offerte
            this.offerService.getOffers(this.supermarketId).subscribe({
              next: (offersRes: any) => {
                const offers = offersRes.data?.offers ?? [];
                const offeredProductIds = new Set<number>(offers.map((o: any) => o.product_id));
                this.products = products.map(p => ({
                  ...p,
                  hasOffer: offeredProductIds.has(p.id),
                  isAssigned: assignedProductIds.has(p.id)
                }));
                // Ordina: prima assegnati+offerta, poi assegnati, poi non assegnati
                this.products.sort((a, b) => {
                  // Primo criterio: assegnato e in offerta
                  if (a.isAssigned && a.hasOffer && !(b.isAssigned && b.hasOffer)) return -1;
                  if (!(a.isAssigned && a.hasOffer) && (b.isAssigned && b.hasOffer)) return 1;
                  // Secondo criterio: assegnato
                  if (a.isAssigned && !b.isAssigned) return -1;
                  if (!a.isAssigned && b.isAssigned) return 1;
                  // Altrimenti lascia ordine originale
                  return 0;
                });
              },
              error: () => {
                this.products = products.map(p => ({
                  ...p,
                  hasOffer: false,
                  isAssigned: assignedProductIds.has(p.id)
                }));
              }
            });
          },
          error: () => {
            // Se errore nel recupero prodotti assegnati, fallback: nessun prodotto assegnato
            this.products = products.map(p => ({
              ...p,
              hasOffer: false,
              isAssigned: false
            }));
          }
        });
      },
      error: () => {
        this.snackBar.open('Errore caricamento prodotti', 'Chiudi', { duration: 3000 });
      }
    });
  }

  addProduct(product: any, quantityValue: string, priceValue: string): void {
    const price = Number(priceValue);
    const quantity = Number(quantityValue);

    let payload: any = { product_id: product.id, quantity };

    // Se il prezzo o la quantità sono entrmabi 0 o entrambi nulli, errore
    if(((price <= 0 && priceValue !== '') || (quantity <= 0 && quantityValue !== '')) || (quantityValue === '' && priceValue === '')){
      this.snackBar.open('Il prezzo e la quantità devono  essere maggiori di 0!', 'Chiudi', { duration: 3000 });
      return;
    }

    // Se la quantità è vuota, aggiorno solo il prezzo
    if (quantityValue === '') {
      this.supermarketService.getProductQuantity(this.supermarketId, product.id).subscribe({
        next: (quantitaAttuale: number) => {
          if (quantitaAttuale > 0) {
            payload.quantity = quantitaAttuale;
            payload.price = price;
            this.productService.updateProduct(this.supermarketId, product.id, payload).subscribe({
              next: () => {
                this.snackBar.open('Prezzo aggiornato con successo', 'Chiudi', { duration: 3000 });
                this.loadProdottiOfferte();
              }
            });
          } else {
            this.snackBar.open('Il prodotto non è presente nel supermercato: nserisci una quantità positiva!', 'Chiudi', { duration: 3000 });
          }
        }
      });
      return;
    }

    // Se il prezzo è vuoto, aggiorno solo la quantità
    if (priceValue === '') {
      
      this.supermarketService.getProducts(this.supermarketId).subscribe({
        next: (res: any) => {
          const prodotto = res.products.find((p: any) => p.id === product.id);
          if (prodotto && prodotto.price !== undefined) {
            payload.price = prodotto.price;
          }else{
            this.snackBar.open('Errore! Definisci il prezzo del prodotto!', 'Chiudi', { duration: 3000 });
          }
        },
        error: () => {
          this.snackBar.open('Errore nel recupero del prezzo attuale', 'Chiudi', { duration: 3000 });
        }
      });

      this.updateProduct(product, quantity, payload, true);
      return;

    }else{
      payload.price = price;
    }
    

    this.productService.addToSupermarket(this.supermarketId, payload).subscribe({
      next: () => {
        this.snackBar.open('Prodotto aggiunto con successo', 'Chiudi', { duration: 3000 });
        this.loadProdottiOfferte();
      },
      error: () => {
        // Se da errore allora è già presente, perciò è da aggiornare
        this.updateProduct(product, quantity, payload);
      }
    });
  }


  private updateProduct(product: any, quantity: number, payload: any, onlyQuantity: boolean = false): void {

    this.supermarketService.getProductQuantity(this.supermarketId, product.id).subscribe({
      next: (quantitaAttuale: number) => {
        const nuovaQuantita = quantitaAttuale + quantity;
        payload.quantity = nuovaQuantita;
        this.productService.updateProduct(this.supermarketId, product.id, payload).subscribe({
          next: () => {
            this.snackBar.open('Prodotto aggiornato con successo', 'Chiudi', { duration: 3000 });
            this.loadProdottiOfferte();
          },
          error: () => {
            if (!onlyQuantity)
              this.snackBar.open('Errore durante il salvataggio del prodotto!!', 'Chiudi', { duration: 3000 });
          }
        });
      },
      error: () => {
        this.snackBar.open('Errore nel recupero della quantità attuale', 'Chiudi', { duration: 3000 });
      }
    });
  }
}
