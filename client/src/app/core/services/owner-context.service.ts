import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { RestaurantService } from './restaurant.service';
import { Role, Restaurant } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OwnerContextService {
  private readonly restaurantService = inject(RestaurantService);
  private readonly authService = inject(AuthService);

  readonly restaurants = signal<Restaurant[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly loading = signal(false);

  readonly selected = computed(() =>
    this.restaurants().find(r => r.id === this.selectedId()) ?? null
  );

  load(): void {
    this.loading.set(true);
    this.restaurantService.getAll().subscribe({
      next: (all) => {
        const user = this.authService.currentUser();
        const mine = user?.role === Role.ADMIN
          ? all
          : all.filter(r => r.ownerId === user?.id);
        this.restaurants.set(mine);
        if (!this.selectedId() && mine.length) {
          this.selectedId.set(mine[0].id);
        } else if (this.selectedId() && !mine.some(r => r.id === this.selectedId())) {
          this.selectedId.set(mine[0]?.id ?? null);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  select(id: string): void {
    this.selectedId.set(id);
  }

  upsert(restaurant: Restaurant): void {
    this.restaurants.update(list => {
      const idx = list.findIndex(r => r.id === restaurant.id);
      if (idx === -1) return [...list, restaurant];
      const copy = [...list];
      copy[idx] = restaurant;
      return copy;
    });
    this.selectedId.set(restaurant.id);
  }

  remove(id: string): void {
    this.restaurants.update(list => list.filter(r => r.id !== id));
    if (this.selectedId() === id) {
      this.selectedId.set(this.restaurants()[0]?.id ?? null);
    }
  }
}
