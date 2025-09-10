import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  supermarketId: number;
  supermarketName: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {

  constructor(private authService: AuthService) {}

  // Recupera la chiave del carrello dal localStorage
  private async cartKey() : Promise<string> {
    const user = await this.authService.getUser();
    if (!user) {
      throw new Error('Nessun utente loggato: impossibile accedere al carrello');
    }

    const key = `cart_items_${user.id}`;

    // Se la chiave non è presente nel localStorage, prima di restituirla la inserisce
    let checkCarrello = localStorage.getItem(key);
    if (checkCarrello === null) {
      localStorage.setItem(key, JSON.stringify([]));
    }

    return key;
  }

  // Salva il carrello nel localStorage
  private async setCart(cart: CartItem[]): Promise<void> {
    const key = await this.cartKey();
    localStorage.setItem(key, JSON.stringify(cart));
  }

  // Recupera il carrello dal localStorage
  async getCart(): Promise<CartItem[]> {
    const key = await this.cartKey();
    const cart = localStorage.getItem(key);
    return cart ? JSON.parse(cart) : [];
  }

  // Aggiunge un prodotto al carrello
  async addItem(item: Omit<CartItem, 'quantity'>, quantity = 1): Promise<void> {
    const cart = await this.getCart();
    const index = cart.findIndex(cartItem =>
      cartItem.productId === item.productId &&
      cartItem.supermarketId === item.supermarketId
    );
    if (index >= 0) {
      cart[index].quantity += quantity;
    } else {
      cart.push({ ...item, quantity });
    }
    await this.setCart(cart);
  }

  async decreaseItem(productId: number, supermarketId: number, quantity = 1): Promise<void> {
    const cart = await this.getCart();
    const idx = cart.findIndex(
      cartItem => cartItem.productId === productId && cartItem.supermarketId === supermarketId
    );
    if (idx >= 0) {
      cart[idx].quantity -= quantity;
      if (cart[idx].quantity <= 0) {
        cart.splice(idx, 1);
      }
      await this.setCart(cart);
    }
  }

  async increaseItem(productId: number, supermarketId: number, quantity = 1): Promise<void> {
    const cart = await this.getCart();
    const idx = cart.findIndex(
      cartItem => cartItem.productId === productId && cartItem.supermarketId === supermarketId
    );
    if (idx >= 0) {
      cart[idx].quantity += quantity;
      await this.setCart(cart);
    }
  }

  async removeItem(productId: number, supermarketId: number): Promise<void> {
    const cart = (await this.getCart()).filter(
      cartItem => !(cartItem.productId === productId && cartItem.supermarketId === supermarketId)
    );
    await this.setCart(cart);
  }

  async getGroupedCart(): Promise<{ supermarketId: number; supermarketName: string; items: CartItem[]; total: number }[]> {
    const items = await this.getCart();
    const cartGroups: { [key: number]: { supermarketId: number; supermarketName: string; items: CartItem[]; total: number } } = {};
    items.forEach(item => {
      const key = item.supermarketId;
      const name = item.supermarketName;
      if (!cartGroups[key]) {
        cartGroups[key] = { supermarketId: key, supermarketName: name, items: [], total: 0 };
      }
      cartGroups[key].items.push(item);
      cartGroups[key].total += item.price * item.quantity;
    });
    return Object.values(cartGroups);
  }
}
