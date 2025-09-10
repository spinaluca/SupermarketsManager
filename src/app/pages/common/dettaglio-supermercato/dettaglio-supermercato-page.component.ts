import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SupermarketService } from '../../../services/supermercati/supermercati.service';
import { OfferService } from '../../../services/offerte/offerte.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ProductCardComponent } from '../../../util/card/product-card/product-card.component';
import { HeaderComponent } from '../../../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { CartPreviewComponent } from '../../customer/carrello/cart-preview/cart-preview.component';
import { SupermarketCardComponent } from '../../../util/card/supermarket-card/supermarket-card.component';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dettaglio-supermercato',
  templateUrl: './dettaglio-supermercato-page.component.html',
  styleUrls: ['./dettaglio-supermercato-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    HeaderComponent,
    ProductCardComponent,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    CartPreviewComponent,
    SupermarketCardComponent,
    MatDividerModule
  ]
})
export class DettaglioSupermercatoPage implements OnInit {
  public closeFabTooltip(tooltip: MatTooltip) {
    tooltip?.hide?.();
  }

  backUrl: string = '/dashboard';

  isCustomer = false;
  isAdminOrManager = false;

  supermarket: any = null;
  products: any[] = [];
  filteredProducts: any[] = [];

  searchTerm: string = '';
  selectedCategory: string = '';
  availableCategories: string[] = [];

  showCartPreview = false;

  constructor(
    private route: ActivatedRoute,
    private supermarketService: SupermarketService,
    private offerService: OfferService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const userRole = await this.authService.getUserRole();
    this.isCustomer = userRole === 'customer';
    if(!this.isCustomer)
      this.isAdminOrManager = userRole === 'admin' || userRole === 'manager';
    this.backUrl = userRole === 'admin' ? '/lista-supermercati' : '/dashboard';

    this.loadData(Number(this.route.snapshot.paramMap.get('id') ?? 1));
  }

  ionViewWillEnter() {

    // Dopo che viene aggiunto un nuovo prodotto al supermercato dal DB
    // mi assicuro che al rientro in questa pagina venga ricaricato
    if(this.supermarket?.id)
      this.loadData(this.supermarket.id);

  }

  private loadData(id: number): void {

    this.supermarketService.getOne(id).subscribe((res: any) => {

      // Se il backend restituisce null
      if (!res.supermarket) {
        this.snackBar.open('Errore! Supermercato non trovato!', 'Chiudi', { duration: 4000 });
        this.router.navigate([this.backUrl]);
        return;
      }

      this.supermarket = res.supermarket;


      this.supermarketService.getProducts(id).subscribe((res: any) => {

        const rawProducts = res.products ?? [];
        const products = rawProducts.map((p: any) => ({ // Ai prodotti aggiungo ID del sm e Nome
          ...p,
          supermarketId: id,
          supermarketName: this.supermarket?.name ?? ''
        }));


        this.offerService.getOffers(id).subscribe((offersRes: any) => {

          const offersList = offersRes.data?.offers ?? [];

          // Struttura che conterrà il prodotto + l'offerta di quel prodotto, se presente in OfferList
          // ovvero se in OfferList trova un off.product_id === p.id
          const enriched = products.map((p: any) => {
            const offer = offersList.find((off: any) => off.product_id === p.id);
            return {
              ...p,
              offer: offer
                ? {
                    ...offer,
                    supermarket_name: this.supermarket?.name ?? '',
                    supermarket_id: this.supermarket?.id ?? null,
                    quantity: p.quantity
                  }
                : null
            };
          });

          this.products = enriched;
          this.filteredProducts = [...enriched];
          this.estraiCategorie(enriched);
        });
      });
    });
  }

  // Recupero categorie prodotti
  private estraiCategorie(products: any[]): void {

    const categories = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });

    this.availableCategories = Array.from(categories).sort();

  }


// Filtro per barra di ricerca e categoria
  filterProdotti(): void {
    const searchTerm = this.searchTerm.trim().toLowerCase();
    const categoryFilter = this.selectedCategory;


    this.filteredProducts = this.products.filter(p => (
      (!searchTerm || [p.name, p.description].some(val => (val ?? '').toLowerCase().includes(searchTerm))) &&
      (!categoryFilter || p.category === categoryFilter)
    ));

  }

  openCartPreview(): void {
    this.showCartPreview = true;
  }

  closeCartPreview(): void {
    this.showCartPreview = false;
  }

  addProductsFromDatabase(): void {
    if (this.supermarket) {
      this.router.navigate(['agg-prodotti-al-supermercato', this.supermarket.id]);
    }
  }

  generaRandomOffer(): void {

    if (this.allProductsHaveOffer) {
      this.snackBar.open('Tutti i prodotti hanno già un\'offerta!!', 'Chiudi', { duration: 4000 });
      return;
    }
    if (this.filteredProducts.length === 0) {
      this.snackBar.open('Nessun prodotto trovato!', 'Chiudi', { duration: 4000 });
      return;
    }

    this.offerService.generate(this.supermarket.id).subscribe({
      next: () => {

        this.snackBar.open('Offerte generate con successo', 'Chiudi', { duration: 3000 });
        setTimeout(() => { // Timeout per permettere l'aggiornamento delle offerte nel DB
          this.loadData(this.supermarket.id);
        }, 1200)

      },
      error: (err) => {
        this.snackBar.open('Errore durante la generazione delle offerte!', 'Chiudi', { duration: 4000 });
      }
    });
  }

  // Prodotti mostrati nella sezione in offerta
  get filteredProductsWithOffer() {
    return this.filteredProducts.filter(p => p.offer);
  }

  // Prodotti mostrati nella sezione non in offerta
  get filteredProductsWithoutOffer() {
    return this.filteredProducts.filter(p => !p.offer);
  }

  // Titolo diverso se ci sono offerte o no
  get sectionTitle() {
    return this.products.some(p => p.offer) ? 'Altri Prodotti:' : 'Prodotti:';
  }

  // Mostro il banner: Tutti i prodotti sono in offerta
  get allProductsHaveOffer() {
    return this.products.length > 0 && this.products.every(p => p.offer);
  }
}
