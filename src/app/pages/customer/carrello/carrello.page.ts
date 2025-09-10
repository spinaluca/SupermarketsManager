import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonNote,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/header/header.component';
import { CartService } from 'src/app/services/carrello/carrello.service';
import { PurchaseService } from 'src/app/services/acquisti/acquisti.service';


interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  supermarketId: number;
  supermarketName: string;
}


@Component({
  selector: 'app-carrello',
  templateUrl: './carrello.page.html',
  styleUrls: ['./carrello.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonNote,
  ]
})
export class CarrelloPage {

  groupedCart: any[] = [];

  constructor(
    private cartService: CartService,
    private purchaseService: PurchaseService,
    private snackBar: MatSnackBar
  ) {}

  ionViewWillEnter() {
    this.aggiornaGroupedCart();
  }

  private async aggiornaGroupedCart() {
    this.groupedCart = await this.cartService.getGroupedCart();
  }

  async removeProduct(item: CartItem): Promise<void> {
    await this.cartService.removeItem(item.productId, item.supermarketId);
    await this.aggiornaGroupedCart();
  }

  async increaseItem(item: CartItem): Promise<void> {
    await this.cartService.increaseItem(item.productId, item.supermarketId, 1);
    await this.aggiornaGroupedCart();
  }

  async decreaseItem(item: CartItem): Promise<void> {
    await this.cartService.decreaseItem(item.productId, item.supermarketId, 1);
    await this.aggiornaGroupedCart();
  }


  // Acquisto di tutti i prodotti di un carrello (ogni carrello riguarda uno specifico supermercato)
  async acquista(supermarketId: number): Promise<void> {
    const items = (await this.cartService.getCart()).filter((item: CartItem) => item.supermarketId === supermarketId);
    const requests = items.map((item: CartItem) =>
      firstValueFrom(
        this.purchaseService.purchase(supermarketId, item.productId, { quantity: item.quantity })
      ).then(
        res => ({ success: true, res, item }),
        err => ({ success: false, error: err, item })
      )
    );
    const results = await Promise.all(requests);

    // Rimuovo dal carrello tutti i prodotti acquistati e lo aggiorno
    for (const r of results.filter((r: any) => r.success)) {
      await this.cartService.removeItem(r.item.productId, r.item.supermarketId);
    }
    await this.aggiornaGroupedCart();


    // Gestione risultati acquisto
    const productOk: string[] = []; // di questi mi salvo solo il nome
    const productFailedQuantity: { name: string, available: any }[] = []; // di questi mi salvo nome e quantità disponibile ricevuta dal backend

    results.forEach((r: any) => {
      if (r.success) {
        productOk.push(r.item.name);

      } else if ('error' in r) {
        productFailedQuantity.push({ name: r.item.name, available: r.error.error.available_quantity });
      }
    });


    // Gestione della snackbar di fine acquisto
    if (productFailedQuantity.length) { // Se c'è almeno un prodotto per cui è fallito l'acquisto
      // Mostro un messaggio di riepilogo con i prodotti acquistati e non
      // In prima riga tutti i prodotti acquistati, nella seconda tutti quelli non acquistati con relative disponibilità
      const msgLines = [];

      if (productOk.length) {
        msgLines.push('Acquistati: ' + productOk.join(', '));
      }
      msgLines.push('Non acquistati: ' + productFailedQuantity.map(f => `${f.name} (disponibili: ${f.available})`).join(', '));
      this.snackBar.open(
        msgLines.join('\n'),
        'Chiudi', {duration: 10000, panelClass: ['multi-line']}
      );
    } else {
      this.snackBar.open('Tutti i prodotti del carrello sono stati acquistati!', 'Chiudi', { duration: 4000 });
    }

  }
}
