import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MiniMapComponent } from '../../mini-map/mini-map.component';

@Component({
  selector: 'app-supermarket-card',
  templateUrl: './supermarket-card.component.html',
  styleUrls: ['./supermarket-card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MiniMapComponent]
})
export class SupermarketCardComponent {
  @Input() supermarket!: any;
  @Input() big: boolean = false;

  @Output() cardClick = new EventEmitter<void>();

  constructor() {}
  
  emitClick(): void {
    this.cardClick.emit();
  }
}