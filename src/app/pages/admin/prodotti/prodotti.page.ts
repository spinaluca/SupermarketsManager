import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { HeaderComponent } from '../../../header/header.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DialogGenericoComponent } from 'src/app/util/dialog-generico/dialog-generico.component';
import { ProductCardComponent } from '../../../util/card/product-card/product-card.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTooltip } from '@angular/material/tooltip';
import { ProductService } from '../../../services/prodotti/prodotti.service';
import { SupermarketService } from '../../../services/supermercati/supermercati.service';

@Component({
  selector: 'app-prodotti',
  templateUrl: './prodotti.page.html',
  styleUrls: ['./prodotti.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatListModule,
    HeaderComponent,
    MatDialogModule,
    MatButtonModule,
    ProductCardComponent,
    MatTooltipModule,
  ]
})
export class ProdottiPage implements OnInit {
  public closeFabTooltip(tooltip: MatTooltip) {
    tooltip?.hide?.();
  }
  products: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private productService: ProductService,
    private supermarketService: SupermarketService
  ) {}

  ngOnInit(): void {
    this.caricaProdotti();
  }

  caricaProdotti(): void {
    
    this.dashboardService.getDashboard().subscribe({
      
      next: (res: any) => {
        const payload = res.data;
        this.products = payload.products ?? [];
        
      },
      error: () => {
        this.snackBar.open('Errore caricamento prodotti', 'Chiudi', { duration: 3000 });
      }
    });
  }

  async apriProductDialog(): Promise<void> {
    // Recupera tutte le categorie uniche dai prodotti
    let categorie: string[] = [];
    try {
      const prodotti = await this.supermarketService.getAllProducts().toPromise();
      if (Array.isArray(prodotti)) {
        categorie = Array.from(new Set(prodotti.map((p: any) => p.category).filter((c: any) => !!c)));
      } else {
        categorie = [];
      }
    } catch (e) {
      categorie = [];
    }

    const productFields = [
      { name: 'name', label: 'Nome Prodotto', placeholder: 'Inserisci nome', type: 'text', icon: 'title', required: true, errorMsg: 'Il nome è obbligatorio' },
      { name: 'description', label: 'Descrizione', placeholder: 'Inserisci descrizione', type: 'textarea', icon: 'description', required: true, errorMsg: 'La descrizione è obbligatoria' },
      { name: 'category', label: 'Categoria', placeholder: 'Seleziona o inserisci una categoria', type: 'category-autocomplete', icon: 'category', required: true, errorMsg: 'La categoria è obbligatoria', options: categorie },
      { name: 'barcode', label: 'Barcode', placeholder: 'Inserisci barcode (EAN)', type: 'text', icon: 'qr_code', required: true, errorMsg: 'Il barcode (EAN, 13 caratteri numerici) è obbligatorio' }
    ];

    const dialogRef = this.dialog.open(DialogGenericoComponent, {
      maxWidth: '95vw',
      width: '600px',
      height: 'auto',
      panelClass: 'transparent-dialog',
      backdropClass: 'dialog-backdrop',
      disableClose: false,
      autoFocus: false,
      data: {
        fields: productFields,
        title: 'Nuovo Prodotto',
        subtitle: 'Aggiungi un nuovo prodotto',
        icon: 'add_box',
        saveLabel: 'Salva Prodotto'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.addProduct(result).subscribe({
          next: () => {
            this.snackBar.open('Prodotto aggiunto con successo', 'Chiudi', { duration: 3000 });
            this.caricaProdotti();
          },
          error: () => {
            this.snackBar.open('Errore durante il salvataggio', 'Chiudi', { duration: 3000 });
          }
        });
      }
    });
  }
}
