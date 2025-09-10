import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { ListaSupermercatiPage } from '../../pages/common/lista-supermercati/lista-supermercati-page.component';

@Component({
  selector: 'app-dashboard-manager',
  templateUrl: './manager-dashboard.page.html',
  styleUrls: ['./manager-dashboard.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    ListaSupermercatiPage
  ]
})
export class ManagerDashboardPage {}
