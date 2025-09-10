import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import * as L from 'leaflet';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-mini-map',
  templateUrl: './mini-map.component.html',
  styleUrls: ['./mini-map.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatIconModule],
})
export class MiniMapComponent implements AfterViewInit {
  @Input() latitude!: number;
  @Input() longitude!: number;
  @Input() zoom: number = 15;
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.latitude, this.longitude],
      zoom: this.zoom,
      attributionControl: false,
      dragging: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      keyboard: false,
      zoomControl: true,
    });

    // Caricamento tiles mappa (quadrati)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    const noBorderIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: '',
      className: 'marker-no-border', 
    });

    L.marker([this.latitude, this.longitude], { icon: noBorderIcon }).addTo(this.map);

    // Gestione click: solo se non clicchi sui controlli
    this.map.on('click', (e: any) => {
      const target = e.originalEvent?.target as HTMLElement;
      if (target && target.closest('.leaflet-control')) {
        return;
      }
      this.openGoogleMaps();
    });
  }

  // Apertura Google Maps
  openGoogleMaps(): void {
    window.open(`https://www.google.com/maps?q=${this.latitude},${this.longitude}`, '_blank');
  }
}