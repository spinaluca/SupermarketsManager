import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SupermarketService } from '../../../services/supermercati/supermercati.service';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { SupermarketCardComponent } from '../../../util/card/supermarket-card/supermarket-card.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HeaderComponent } from '../../../header/header.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '../../../services/auth/auth.service';
import { DialogGenericoComponent } from 'src/app/util/dialog-generico/dialog-generico.component';

@Component({
  selector: 'app-lista-supermercati',
  templateUrl: './lista-supermercati-page.component.html',
  styleUrls: ['./lista-supermercati-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatListModule,
    SupermarketCardComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
    FormsModule,
    HeaderComponent,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule
  ]
})
export class ListaSupermercatiPage implements OnInit {
  public closeFabTooltip(tooltip: MatTooltip) {
    tooltip?.hide?.();
  }
  supermarkets: any[] = [];
  isManager = false;
  showBack = true;
  @Input() isEmbedded = false;
  @Input() isCustomerDash = false;

  constructor(
    private supermarketService: SupermarketService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isManager = (await this.authService.getUserRole()) === 'manager';
    this.showBack = !this.isEmbedded;
    await this.caricaSupermercati();
  }

  async caricaSupermercati(): Promise<void> {
    if (this.isManager) {
      this.supermarketService.getSupermercatiAssegnati().subscribe({
        next: (supermercati: any[]) => {
          this.supermarkets = supermercati;
        },
        error: (error) => {
          this.snackBar.open('Errore caricamento supermercati', 'Chiudi', { duration: 3000 });
        }
      });
    } else {
      this.supermarketService.getAll().subscribe({
        next: (res: any) => {
          const payload = res.data ?? res;
          this.supermarkets = payload.supermarkets ?? payload ?? [];
        },
        error: (error) => {
          this.snackBar.open('Errore caricamento supermercati', 'Chiudi', { duration: 3000 });
        }
      });
    }
  }

  goSupermarket(sm: any): void {
    this.router.navigate([`/supermercato/${sm.id}`]);
  }

  apriAddSupermarketDialog(): void {
    const supermarketFields = [
      { name: 'name', label: 'Nome Supermercato', placeholder: 'Inserisci nome supermercato', type: 'text', icon: 'store', required: true, errorMsg: 'Il nome è obbligatorio' },
      { name: 'address', label: 'Indirizzo', placeholder: 'Inserisci indirizzo supermercato', type: 'autocomplete', icon: 'location_on', required: true, errorMsg: 'Scegli un indirizzo dai suggerimenti' },
      { name: 'managerName', label: 'Manager', placeholder: '', type: 'select', icon: 'person', required: true, errorMsg: 'Il manager è obbligatorio' }
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
        fields: supermarketFields,
        title: 'Crea Supermercato',
        subtitle: 'Aggiungi un nuovo supermercato',
        icon: 'store',
        saveLabel: 'Salva Supermercato'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const dataToSend = {
          name: result.name,
          address: result.address,
          latitude: result.latitude,
          longitude: result.longitude,
          manager_id: result.managerName,
        };
        this.supermarketService.add(dataToSend).subscribe({
          next: () => {
            this.snackBar.open('Supermercato aggiunto con successo!', 'Chiudi', { duration: 3000 });
            this.caricaSupermercati();
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Errore durante il salvataggio', 'Chiudi', { duration: 3000 });
          }
        });
      }
    });
  }
}
