import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/header/header.component';
import { PurchaseService } from 'src/app/services/acquisti/acquisti.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Acquisto {
  id: number;
  supermarket_name: string;
  product_name: string;
  quantity: number;
  total_price: number;
  purchase_date: string;
}

interface acquistoRaggruppato{
  date: Date;
  supermarket: string;
  acquisti: Acquisto[];
  total: number;
}

@Component({
  selector: 'app-storico-acquisti',
  templateUrl: './storico-acquisti.page.html',
  styleUrls: ['./storico-acquisti.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, IonicModule, MatSnackBarModule]
})
export class StoricoAcquistiPage implements OnInit {
  acquisti: Acquisto[] = [];
  groupedAcquisti: acquistoRaggruppato[] = [];

  constructor(private acquistiService: PurchaseService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {

    // Recupero gli acquisti dal service e li raggruppo
    this.acquistiService.getHistory().subscribe({
      next: (res) => {
        this.acquisti = res.purchases || [];
        this.groupedAcquisti = this.groupAcquisti(this.acquisti);
      },
      error: (err) => {
        this.snackBar.open('Errore nel caricamento del storico', 'Chiudi', { duration: 4000 });
      }
    });
  }

// Raggruppa gli acquisti per orario e supermercato
private groupAcquisti(acquistiNonRaggruppati: Acquisto[]): acquistoRaggruppato[] {

  const map = new Map<string, acquistoRaggruppato>();

  // Per ogni acquisto, genero la sua chiave e in base a quella
  // lo inserisco nel gruppo di appartenenza
  for (const acquisto of acquistiNonRaggruppati) {

    // Converte la data per correggere il fuso orario (+2 ore)
    const data = new Date(acquisto.purchase_date);
    data.setHours(data.getHours() + 2);

    // Chiave unica formata da anno-mese-giorno-ora-minuti-supermercato
    const key = `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}-${data.getHours()}-${data.getMinutes()}-${acquisto.supermarket_name}`;


    // Se la chiave ancora non esiste, creo un nuovo gruppo
    if (!map.has(key)) {
      map.set(key, {
        date: data,
        supermarket: acquisto.supermarket_name,
        acquisti: [],
        total: 0
      });
    }

    // Aggiungo l'acquisto e il totale al gruppo di appartenenza
    const group = map.get(key)!;
    group.acquisti.push(acquisto);
    group.total += acquisto.total_price;
  }

  // Converto la mappa in array e ordino i gruppi per data decrescente
  return Array.from(map.values())
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

}
