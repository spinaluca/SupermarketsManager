import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from 'src/app/services/carrello/carrello.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class ProductCardComponent {

  @Input() showAddToCart: boolean = true;
  @Input() showPrice: boolean = true;
  @Input() showQuantity: boolean = false;
  @Input() showSupermarketName: boolean = false;

  @Input() product?: {
    id?: number;
    name: string;
    category: string;
    description: string;
    price?: number;
  };
  @Input() quantity?: number;

  @Input() offer: {
    offer_id: number;
    supermarket_id: number;
    product_id: number;
    original_price: number;
    offer_price: number;
    end_date: string;
    supermarket_name: string;
    product_name: string;
    product_description: string;
    product_category: string;
    discount_percent: number;
  } | null = null;
  

  @Output() addedToCart = new EventEmitter<void>();



  constructor(private cartService: CartService) {}


  addToCart(product: any): void {

    // Se abbiamo un'offerta, usiamo i dati dell'offerta
    if (this.offer) {
      const item = {
        productId: this.offer.product_id,
        name: this.offer.product_name,
        price: this.offer.offer_price,
        supermarketId: this.offer.supermarket_id,
        supermarketName: this.offer.supermarket_name
      };
      this.cartService.addItem(item, 1);
      this.addedToCart.emit();
      return;
    }

    // Altrimenti usiamo i dati del prodotto
    if (!product) return;
    const item = {
      productId: product.id,
      name: product.name,
      price: product.price ?? 0,
      supermarketId: (product as any).supermarketId ?? 0,
      supermarketName: (product as any).supermarketName ?? ''
    } as const;
    this.cartService.addItem(item, 1);
    this.addedToCart.emit();
    
  }

  // Prezzo barrato solo se c'è un'offerta
  get hasDiscount(): boolean {
    return !!(this.offer);
  }

  // Prezzo principale
  get displayPrice(): number {
    if (this.hasDiscount) {
      return this.offer?.offer_price ?? 0;
    }else{
      return this.product?.price ?? 0;
    }
  }

  // Mostra il nome supermercato o dai dati del prodotto o da quelli dell'offerta
  get supermarketName(): string {
    return this.offer?.supermarket_name || (this.product as any)?.supermarketName || '';
  }
} 