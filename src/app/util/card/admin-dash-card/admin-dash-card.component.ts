import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-admin-dash-card',
  templateUrl: './admin-dash-card.component.html',
  styleUrls: ['./admin-dash-card.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    NgClass,
    IonicModule
  ]
})
export class AdminDashCardComponent {
  @Input() icon: string = '';
  @Input() iconColor: 'blu' | 'arancione' | 'rosso' = 'blu';
  @Input() title: string = '';
  @Input() value: number | string = '';
  @Input() label: string = '';
} 