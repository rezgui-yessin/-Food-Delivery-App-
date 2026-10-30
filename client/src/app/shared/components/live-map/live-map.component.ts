import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';

export interface LiveMapMarker {
  label: string;
  latitude?: number;
  longitude?: number;
}

declare global {
  interface Window { google?: any; }
}

@Component({
  selector: 'app-live-map',
  standalone: true,
  template: `<div #map class="w-full h-full min-h-[260px] rounded-xl bg-slate-100 dark:bg-slate-800"></div>`
})
export class LiveMapComponent implements AfterViewInit, OnChanges {
  @Input() markers: LiveMapMarker[] = [];
  @Input() route = true;
  @ViewChild('map') private mapElement!: ElementRef<HTMLDivElement>;
  private map: any;
  private directions: any;
  private readonly scriptId = 'google-maps-sdk';

  ngAfterViewInit(): void {
    this.loadSdk().then(() => this.render());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['markers'] && this.map) this.render();
  }

  private async loadSdk(): Promise<void> {
    if (window.google?.maps) return;
    if (!environment.googleMapsApiKey) return;
    await new Promise<void>((resolve, reject) => {
      const existing = document.getElementById(this.scriptId) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = this.scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(environment.googleMapsApiKey)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Maps failed to load'));
      document.head.appendChild(script);
    });
  }

  private render(): void {
    const points = this.markers.filter(marker => marker.latitude != null && marker.longitude != null);
    if (!window.google?.maps || !points.length) return;
    const center = { lat: points[0].latitude!, lng: points[0].longitude! };
    this.map ??= new window.google.maps.Map(this.mapElement.nativeElement, { center, zoom: 13, mapTypeControl: false });
    this.map.setCenter(center);
    points.forEach(point => new window.google.maps.Marker({
      map: this.map,
      position: { lat: point.latitude, lng: point.longitude },
      title: point.label
    }));
    if (this.route && points.length >= 2 && window.google.maps.DirectionsService) {
      this.directions ??= new window.google.maps.DirectionsRenderer({ map: this.map, suppressMarkers: true });
      new window.google.maps.DirectionsService().route({
        origin: { lat: points[0].latitude, lng: points[0].longitude },
        destination: { lat: points[points.length - 1].latitude, lng: points[points.length - 1].longitude },
        waypoints: points.slice(1, -1).map(point => ({ location: { lat: point.latitude, lng: point.longitude } })),
        travelMode: 'DRIVING'
      }, (result: any, status: string) => {
        if (status === 'OK') this.directions.setDirections(result);
      });
    }
  }
}
