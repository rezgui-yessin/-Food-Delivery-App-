import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { MenuService } from '../../../core/services/menu.service';
import { CartService } from '../../../core/services/cart.service';
import { Restaurant, MenuItem } from '../../../core/models';
import { getDishImage as getDishImageHelper, getRestaurantImage } from '../../../core/utils/asset-helpers';
import { SkeletonMenuItemComponent } from '../../../shared/components/skeleton-card/skeleton-card.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { modalScaleAnimation, fadeAnimation } from '../../../shared/animations/animations';

interface CategorySection {
  name: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SkeletonMenuItemComponent, ModalComponent],
  animations: [modalScaleAnimation, fadeAnimation],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
      <!-- Restaurant Banner with Real Photography -->
      @if (restaurant()) {
        <div class="relative h-64 sm:h-80 overflow-hidden bg-slate-800">
          <img
            [src]="getRestaurantBanner(restaurant()!)"
            [alt]="restaurant()!.name"
            class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/30"></div>

          <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div class="max-w-7xl mx-auto">
              <div class="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-3 py-1 text-xs font-bold bg-primary text-white rounded-lg shadow-sm">
                      {{ restaurant()!.cuisineType }}
                    </span>
                    <span class="px-2.5 py-1 text-xs font-bold bg-white/20 backdrop-blur-md text-white rounded-lg">
                      ⭐ {{ restaurant()!.rating || 4.9 }} (500+ reviews)
                    </span>
                  </div>
                  <h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">{{ restaurant()!.name }}</h1>
                  <p class="text-slate-200 text-sm mt-1.5 flex items-center gap-2">
                    <span>📍 {{ restaurant()!.address }}</span>
                    <span>•</span>
                    <span>📞 {{ restaurant()!.phone }}</span>
                  </p>
                </div>

                <div class="flex items-center gap-3">
                  <span class="px-3.5 py-1.5 text-sm font-bold rounded-xl shadow"
                    [class]="restaurant()!.open ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-100'">
                    {{ restaurant()!.open ? '● Open Now' : '● Closed' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="h-64 sm:h-80 bg-slate-800 animate-pulse"></div>
      }

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Sticky Category Tabs -->
        @if (categories().length > 0) {
          <div class="sticky top-16 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md pt-3 pb-0 border-b border-slate-200 dark:border-slate-800 mb-8">
            <div class="flex gap-2 overflow-x-auto pb-3">
              @for (category of categories(); track category) {
                <button
                  (click)="scrollToCategory(category)"
                  class="px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all flex-shrink-0"
                  [class]="activeCategory() === category
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'">
                  {{ category }}
                </button>
              }
            </div>
          </div>
        }

        <!-- Menu Sections -->
        @if (isLoading()) {
          <div class="space-y-4">
            @for (i of skeletons; track $index) {
              <app-skeleton-menu-item />
            }
          </div>
        } @else if (menuSections().length === 0) {
          <div class="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <div class="text-5xl mb-4">📋</div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">No menu items available yet</h3>
            <p class="text-sm text-slate-500">Check back later or browse other partner restaurants.</p>
          </div>
        } @else {
          <div class="space-y-12">
            @for (section of menuSections(); track section.name) {
              <div [id]="section.name" class="scroll-mt-32">
                <div class="flex items-center gap-3 mb-6">
                  <span class="w-1.5 h-7 bg-primary rounded-full"></span>
                  <h2 class="text-2xl font-bold text-slate-800 dark:text-white">{{ section.name }}</h2>
                  <span class="text-xs text-slate-400 font-semibold">({{ section.items.length }} dishes)</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  @for (item of section.items; track item.id) {
                    <div class="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:shadow-lg hover:border-primary/40 transition-all group">
                      <!-- Dish Image with Real Photography -->
                      <div class="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 relative">
                        <img
                          [src]="getDishImage(item)"
                          [alt]="item.name"
                          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                        @if (!item.available) {
                          <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span class="text-[10px] font-bold text-white uppercase tracking-wider">Sold Out</span>
                          </div>
                        }
                      </div>

                      <!-- Dish Info -->
                      <div class="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div class="flex items-start justify-between gap-2">
                            <h3 class="font-bold text-slate-800 dark:text-white text-base leading-snug group-hover:text-primary transition-colors">
                              {{ item.name }}
                            </h3>
                          </div>
                          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{{ item.description }}</p>
                        </div>

                        <div class="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <span class="text-lg font-extrabold text-primary">\${{ item.price.toFixed(2) }}</span>
                          <button
                            (click)="openAddModal(item)"
                            [disabled]="!item.available || !restaurant()?.open"
                            class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm">
                            <span class="text-base leading-none">+</span>
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Add Item Modal with Real Food Photo Preview -->
    <app-modal
      [isOpen]="isModalOpen()"
      [title]="selectedItem()?.name || ''"
      (close)="closeModal()">

      @if (selectedItem()) {
        <div class="space-y-4">
          <div class="w-full h-44 rounded-xl overflow-hidden shadow-sm relative">
            <img [src]="getDishImage(selectedItem()!)" [alt]="selectedItem()!.name" class="w-full h-full object-cover">
          </div>

          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ selectedItem()!.description }}</p>

          <div class="text-2xl font-extrabold text-primary">\${{ selectedItem()!.price.toFixed(2) }}</div>

          <!-- Quantity Stepper -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Quantity</label>
            <div class="flex items-center gap-3">
              <button (click)="decreaseQty()" [disabled]="modalQty <= 1"
                class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-700 dark:text-white hover:bg-primary hover:text-white disabled:opacity-40 transition-all">−</button>
              <span class="w-10 text-center text-xl font-extrabold text-slate-800 dark:text-white">{{ modalQty }}</span>
              <button (click)="increaseQty()" [disabled]="modalQty >= 50"
                class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-700 dark:text-white hover:bg-primary hover:text-white disabled:opacity-40 transition-all">+</button>
            </div>
          </div>

          <!-- Special Instructions -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Special Instructions (optional)</label>
            <textarea
              [(ngModel)]="specialInstructions"
              placeholder="e.g. Dressing on the side, extra crispy, no onions..."
              rows="2"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"></textarea>
          </div>

          <!-- Item Total -->
          <div class="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-700">
            <span class="text-sm font-semibold text-slate-500">Order Total:</span>
            <span class="text-2xl font-extrabold text-primary">\${{ getItemTotal() }}</span>
          </div>

          <button
            (click)="addToCart()"
            class="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 text-sm">
            Add to Cart — \${{ getItemTotal() }}
          </button>
        </div>
      }
    </app-modal>
  `
})
export class RestaurantDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly restaurantService = inject(RestaurantService);
  private readonly menuService = inject(MenuService);
  private readonly cartService = inject(CartService);

  readonly restaurant = signal<Restaurant | null>(null);
  private readonly menuItems = signal<MenuItem[]>([]);
  readonly isLoading = signal(true);
  readonly isModalOpen = signal(false);
  readonly selectedItem = signal<MenuItem | null>(null);
  readonly activeCategory = signal('');

  modalQty = 1;
  specialInstructions = '';
  readonly skeletons = Array(6).fill(null);

  readonly categories = computed(() =>
    [...new Set(this.menuItems().map(i => i.category))]
  );

  readonly menuSections = computed<CategorySection[]>(() => {
    return this.categories().map(cat => ({
      name: cat,
      items: this.menuItems().filter(i => i.category === cat)
    }));
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.restaurantService.getById(id).subscribe({
      next: (r) => this.restaurant.set(r),
      error: () => {}
    });

    this.menuService.getByRestaurant(id).subscribe({
      next: (items) => {
        this.menuItems.set(items);
        this.isLoading.set(false);
        if (items.length > 0) {
          this.activeCategory.set(items[0].category);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getRestaurantBanner(restaurant: Restaurant): string {
    return getRestaurantImage(restaurant.name, restaurant.cuisineType, restaurant.imageUrl);
  }

  getDishImage(item: MenuItem): string {
    return getDishImageHelper(item.name, item.imageUrl);
  }

  getItemTotal(): string {
    const item = this.selectedItem();
    if (!item) return '0.00';
    return (item.price * this.modalQty).toFixed(2);
  }

  openAddModal(item: MenuItem): void {
    this.selectedItem.set(item);
    this.modalQty = 1;
    this.specialInstructions = '';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedItem.set(null);
  }

  increaseQty(): void {
    if (this.modalQty < 50) this.modalQty++;
  }

  decreaseQty(): void {
    if (this.modalQty > 1) this.modalQty--;
  }

  addToCart(): void {
    const item = this.selectedItem();
    const restaurant = this.restaurant();
    if (!item || !restaurant) return;

    this.cartService.addItem({
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity: this.modalQty,
      specialInstructions: this.specialInstructions || undefined,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name
    });

    this.closeModal();
    this.cartService.toggleDrawer(true);
  }

  scrollToCategory(category: string): void {
    this.activeCategory.set(category);
    const el = document.getElementById(category);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
