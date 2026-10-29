import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { Restaurant } from '../../../core/models';
import { SkeletonRestaurantCardComponent } from '../../../shared/components/skeleton-card/skeleton-card.component';
import { staggerListAnimation, fadeAnimation } from '../../../shared/animations/animations';

interface CuisineFilter {
  label: string;
  emoji: string;
  value: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SkeletonRestaurantCardComponent],
  animations: [staggerListAnimation, fadeAnimation],
  template: `
    <div class="min-h-screen">
      <!-- Hero Section -->
      <section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 text-white overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80')] bg-cover bg-center opacity-20"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
            Delicious food,<br>
            <span class="text-primary bg-clip-text">delivered fast</span>
          </h1>
          <p class="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
            Discover the best restaurants near you and get food delivered in 30 minutes or less.
          </p>

          <!-- Search Bar -->
          <div class="max-w-xl mx-auto relative">
            <div class="flex gap-3 bg-white rounded-2xl p-2 shadow-2xl">
              <div class="flex-1 flex items-center gap-3 px-3">
                <svg class="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearchChange($event)"
                  type="text"
                  placeholder="Search restaurants or cuisines..."
                  class="flex-1 text-slate-800 placeholder-slate-400 outline-none text-sm py-1.5">
              </div>
              <button
                (click)="loadRestaurants()"
                class="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <!-- Cuisine Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
          @for (cuisine of cuisineFilters; track cuisine.value) {
            <button
              (click)="selectCuisine(cuisine.value)"
              class="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 border"
              [class]="selectedCuisine() === cuisine.value
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary'">
              <span>{{ cuisine.emoji }}</span>
              <span>{{ cuisine.label }}</span>
            </button>
          }
        </div>

        <!-- Filter Bar -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-800 dark:text-white">
            @if (selectedCuisine() && selectedCuisine() !== 'all') {
              {{ getSelectedCuisineEmoji() }} {{ selectedCuisine() }} Restaurants
            } @else {
              All Restaurants
            }
            <span class="text-sm font-normal text-slate-400 ml-2">({{ filteredRestaurants().length }})</span>
          </h2>

          <!-- Open Now Toggle -->
          <label class="flex items-center gap-2.5 cursor-pointer">
            <div class="relative">
              <input type="checkbox" [(ngModel)]="openNowOnly" (ngModelChange)="filterRestaurants()" class="sr-only">
              <div class="w-10 h-6 rounded-full transition-colors"
                [class]="openNowOnly ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'"></div>
              <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform" [class.translate-x-4]="openNowOnly"></div>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Open Now</span>
          </label>
        </div>

        <!-- Restaurant Grid -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of skeletons; track $index) {
              <app-skeleton-restaurant-card />
            }
          </div>
        } @else if (error()) {
          <div class="text-center py-20">
            <div class="text-5xl mb-4">😕</div>
            <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Failed to load restaurants</h3>
            <p class="text-slate-400 mb-6 text-sm">{{ error() }}</p>
            <button (click)="loadRestaurants()" class="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors">
              Try Again
            </button>
          </div>
        } @else if (filteredRestaurants().length === 0) {
          <div class="text-center py-20">
            <div class="text-5xl mb-4">🍽️</div>
            <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No restaurants found</h3>
            <p class="text-slate-400 text-sm">Try a different cuisine filter or search term.</p>
          </div>
        } @else {
          <div [@staggerListAnimation]="filteredRestaurants().length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (restaurant of filteredRestaurants(); track restaurant.id) {
              <a [routerLink]="['/restaurants', restaurant.id]" class="group block rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1">
                <!-- Image -->
                <div class="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
                  @if (restaurant.imageUrl) {
                    <img [src]="restaurant.imageUrl" [alt]="restaurant.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-6xl">
                      {{ getCuisineEmoji(restaurant.cuisineType) }}
                    </div>
                  }
                  <!-- Open/Closed badge -->
                  <div class="absolute top-3 right-3">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full shadow-md"
                      [class.bg-emerald-500]="restaurant.open"
                      [class.text-white]="restaurant.open"
                      [class.bg-slate-500]="!restaurant.open"
                      [class.text-slate-100]="!restaurant.open">
                      {{ restaurant.open ? '● Open' : '● Closed' }}
                    </span>
                  </div>
                </div>

                <!-- Content -->
                <div class="p-4">
                  <div class="flex items-start justify-between mb-1.5">
                    <h3 class="font-bold text-slate-800 dark:text-white text-lg leading-tight group-hover:text-primary transition-colors">
                      {{ restaurant.name }}
                    </h3>
                    @if (restaurant.rating) {
                      <span class="flex items-center gap-1 text-sm font-semibold text-amber-500 flex-shrink-0 ml-2">
                        ⭐ {{ restaurant.rating }}
                      </span>
                    }
                  </div>
                  <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{{ restaurant.description }}</p>

                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                      {{ restaurant.cuisineType }}
                    </span>
                    @if (restaurant.deliveryTimeMin) {
                      <span class="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        🕐 {{ restaurant.deliveryTimeMin }}–{{ restaurant.deliveryTimeMin + 10 }} min
                      </span>
                    } @else {
                      <span class="text-xs text-slate-500 dark:text-slate-400">🕐 25–35 min</span>
                    }
                    @if (restaurant.minOrder) {
                      <span class="text-xs text-slate-500 dark:text-slate-400">Min \${{ restaurant.minOrder }}</span>
                    }
                  </div>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);

  private readonly searchSubject = new Subject<string>();
  private allRestaurants = signal<Restaurant[]>([]);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedCuisine = signal('all');

  searchQuery = '';
  openNowOnly = false;

  readonly skeletons = Array(6).fill(null);

  readonly cuisineFilters: CuisineFilter[] = [
    { label: 'All', emoji: '🍽️', value: 'all' },
    { label: 'Pizza', emoji: '🍕', value: 'Pizza' },
    { label: 'Burgers', emoji: '🍔', value: 'Burgers' },
    { label: 'Sushi', emoji: '🍣', value: 'Sushi' },
    { label: 'Healthy', emoji: '🥗', value: 'Healthy' },
    { label: 'Desserts', emoji: '🍰', value: 'Desserts' },
    { label: 'Asian', emoji: '🍜', value: 'Asian' },
    { label: 'Indian', emoji: '🍛', value: 'Indian' },
    { label: 'Mexican', emoji: '🌮', value: 'Mexican' },
  ];

  readonly filteredRestaurants = computed(() => {
    let list = this.allRestaurants();

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.cuisineType.toLowerCase().includes(q)
      );
    }

    if (this.openNowOnly) {
      list = list.filter(r => r.open);
    }

    return list;
  });

  ngOnInit(): void {
    this.loadRestaurants();

    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => {
      this.filterRestaurants();
    });
  }

  loadRestaurants(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const cuisine = this.selectedCuisine() === 'all' ? undefined : this.selectedCuisine();

    this.restaurantService.getAll(cuisine).subscribe({
      next: (data) => {
        this.allRestaurants.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err?.error?.message || 'Failed to load restaurants. Make sure the backend is running at localhost:8081');
      }
    });
  }

  selectCuisine(cuisine: string): void {
    this.selectedCuisine.set(cuisine);
    this.loadRestaurants();
  }

  getSelectedCuisineEmoji(): string {
    const found = this.cuisineFilters.find(c => c.value === this.selectedCuisine());
    return found ? found.emoji : '🍽️';
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  filterRestaurants(): void {
    // Triggers the computed signal to re-evaluate
  }

  getCuisineEmoji(cuisineType: string): string {
    const map: Record<string, string> = {
      'Pizza': '🍕', 'Burgers': '🍔', 'Sushi': '🍣', 'Healthy': '🥗',
      'Desserts': '🍰', 'Asian': '🍜', 'Indian': '🍛', 'Mexican': '🌮',
      'Italian': '🍝', 'Chinese': '🥡', 'Thai': '🍲'
    };
    return map[cuisineType] || '🍽️';
  }
}
