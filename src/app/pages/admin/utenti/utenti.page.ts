import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UtentiService, Utente } from '../../../services/utenti/utenti.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { HeaderComponent } from '../../../header/header.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-utenti',
  templateUrl: './utenti.page.html',
  styleUrls: ['./utenti.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    HeaderComponent,
    FormsModule
  ]
})
export class UtentiPage implements OnInit {
  utenti: Utente[] = [];
  snackBar: any;

  constructor(
    private utentiService: UtentiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.caricaUtenti();
  }

  caricaUtenti(): void {

    this.utentiService.getAll().subscribe({
      next: (res: any) => {
        this.utenti = res;
      },
      error: () => {
        this.snackBar.open('Errore caricamento Utenti', 'Chiudi', { duration: 3000 });
      }
    });
  }


}
