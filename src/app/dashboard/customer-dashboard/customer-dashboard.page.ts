import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SupermarketCardComponent } from '../../util/card/supermarket-card/supermarket-card.component';
import { ProductCardComponent } from '../../util/card/product-card/product-card.component';
import { SupermarketService } from '../../services/supermercati/supermercati.service';
import { OfferService } from '../../services/offerte/offerte.service';
import { Router } from '@angular/router';
import { CartPreviewComponent } from '../../pages/customer/carrello/cart-preview/cart-preview.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ListaSupermercatiPage } from "src/app/pages/common/lista-supermercati/lista-supermercati-page.component";

@Component({
  selector: 'app-dashboard-customer',
  templateUrl: './customer-dashboard.page.html',
  styleUrls: ['./customer-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    IonGrid,
    IonRow,
    IonCol,
    ProductCardComponent,
    CartPreviewComponent,
    IonContent,
    ListaSupermercatiPage
]
})
export class CustomerDashboardPage implements OnInit {
  supermarkets: any[] = [];
  products: any[] = [];
  showCartPreview = false;

  constructor(
    private supermarketService: SupermarketService,
    private offerService: OfferService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSupermarkets();
    this.loadOffersStream();
  }

  private loadSupermarkets(): void {
    this.supermarketService.getAll().subscribe({
      next: (data: any) => {
        this.supermarkets = data.supermarkets ?? [];
      },
      error: () => {
        this.snackBar.open('Errore nel caricamento dei Supermercati', 'Chiudi', { duration: 3000 });
      }
    });
  }

  private loadOffersStream(): void {
    this.products = [];
    this.offerService.loadOfferteStream().subscribe({
      next: (offer: any) => {
        this.products = [...this.products, offer];
      },
      error: () => {
        this.snackBar.open('Errore nel caricamento delle Offerte', 'Chiudi', { duration: 3000 });
      }
    });
  }

  openSupermarket(supermarket: any): void {
    if (!supermarket) return;
    const id = supermarket.id ?? supermarket.supermarket_id ?? supermarket.sm_id ?? null;
    if (!id) {
      this.snackBar.open('Errore nell\'apertura del Supermercato!', 'Chiudi', { duration: 3000 });
      return;
    }
    this.router.navigate([`/supermercato`, id]);
  }

  openCartPreview(): void {
    this.showCartPreview = true;
  }

  closeCartPreview(): void {
    this.showCartPreview = false;
  }

  get noOffers(): boolean {
    return !this.products.some(offer => offer.quantity > 0);
  }
}
