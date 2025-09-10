import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IonList, IonItem, IonLabel, IonBadge, IonNote } from '@ionic/angular/standalone';
import { CartService } from '../../../../services/carrello/carrello.service';

@Component({
  selector: 'app-cart-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
  ],
  templateUrl: './cart-preview.component.html',
  styleUrls: ['./cart-preview.component.scss']
})
export class CartPreviewComponent {
  @Output() close = new EventEmitter<void>();

  groupedCart: any[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.aggiornaGroupedCart();
  }

  async aggiornaGroupedCart() {
    this.groupedCart = await this.cartService.getGroupedCart();
  }

  async increaseItem(item: any): Promise<void> {
    await this.cartService.increaseItem(item.productId, item.supermarketId, 1);
    await this.aggiornaGroupedCart();
  }

  async decreaseItem(item: any): Promise<void> {
    await this.cartService.decreaseItem(item.productId, item.supermarketId, 1);
    await this.aggiornaGroupedCart();
  }

  async removeProduct(item: any): Promise<void> {
    await this.cartService.removeItem(item.productId, item.supermarketId);
    await this.aggiornaGroupedCart();
  }

  goToCart() {
    window.location.href = '/carrello';
    this.close.emit();
  }
}
