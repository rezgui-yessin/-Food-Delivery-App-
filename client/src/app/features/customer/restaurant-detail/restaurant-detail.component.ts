import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { MenuService } from '../../../core/services/menu.service';
import { CartService } from '../../../core/services/cart.service';
import { Restaurant, MenuItem } from '../../../core/models';
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
      <!-- Restaurant Banner -->
      @if (restaurant()) {
        <div class="relative h-56 sm:h-72 bg-gradient-to-br from-slate-700 to-slate-900 overflow-hidden">
          @if (restaurant()!.imageUrl) {
            <img [src]="restaurant()!.imageUrl" [alt]="restaurant()!.name" class="w-full h-full object-cover opacity-60">
          } @else {
            <div class="w-full h-full flex items-center justify-center text-8xl opacity-30">🍽️</div>
          }
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <div class="max-w-7xl mx-auto">
              <div class="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span class="inline-block px-2.5 py-1 text-xs font-bold bg-primary text-white rounded-full mb-2">{{ restaurant()!.cuisineType }}</span>
                  <h1 class="text-3xl sm:text-4xl font-extrabold text-white">{{ restaurant()!.name }}</h1>
                  <p class="text-slate-300 text-sm mt-1">📍 {{ restaurant()!.address }} · 📞 {{ restaurant()!.phone }}</p>
                </div>
                <span class="px-3 py-1.5 text-sm font-bold rounded-full shadow"
                  [class]="restaurant()!.open ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-slate-100'">
                  {{ restaurant()!.open ? '● Open Now' : '● Closed' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="h-56 bg-gradient-to-br from-slate-700 to-slate-900 animate-pulse"></div>
      }

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Sticky Category Tabs -->
        @if (categories().length > 0) {
          <div class="sticky top-16 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md pt-3 pb-0 border-b border-slate-100 dark:border-slate-800 mb-8">
            <div class="flex gap-1 overflow-x-auto pb-3">
              @for (category of categories(); track category) {
                <button
                  (click)="scrollToCategory(category)"
                  class="px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all flex-shrink-0"
                  [class]="activeCategory() === category
                    ? 'bg-primary text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'">
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
          <div class="text-center py-20">
            <div class="text-5xl mb-4">📋</div>
            <p class="text-lg text-slate-500 dark:text-slate-400">No menu items available yet.</p>
          </div>
        } @else {
          <div class="space-y-10">
            @for (section of menuSections(); track section.name) {
              <div [id]="section.name">
                <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <span class="w-1 h-6 bg-primary rounded-full"></span>
                  {{ section.name }}
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  @for (item of section.items; track item.id) {
                    <div class="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-primary/30 transition-all group">
                      <!-- Image -->
                      <div class="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                        @if (item.imageUrl) {
                          <img [src]="item.imageUrl" [alt]="item.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                        } @else {
                          <div class="w-full h-full flex items-center justify-center text-3xl">🍴</div>
                        }
                      </div>

                      <!-- Info -->
                      <div class="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div class="flex items-start justify-between gap-2">
                            <h3 class="font-semibold text-slate-800 dark:text-white leading-tight">{{ item.name }}</h3>
                            @if (!item.available) {
                              <span class="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full flex-shrink-0">Sold Out</span>
                            }
                          </div>
                          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{{ item.description }}</p>
                        </div>

                        <div class="flex items-center justify-between mt-2">
                          <span class="text-base font-bold text-primary">\${{ item.price.toFixed(2) }}</span>
                          <button
                            (click)="openAddModal(item)"
                            [disabled]="!item.available || !restaurant()?.open"
                            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm">
                            <span class="text-base leading-none">+</span>
                            Add
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

    <!-- Add Item Modal -->
    <app-modal
      [isOpen]="isModalOpen()"
      [title]="selectedItem()?.name || ''"
      (close)="closeModal()">

      @if (selectedItem()) {
        <div class="space-y-4">
          @if (selectedItem()!.imageUrl) {
            <img [src]="selectedItem()!.imageUrl" [alt]="selectedItem()!.name" class="w-full h-40 object-cover rounded-xl">
          }
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ selectedItem()!.description }}</p>

          <div class="text-2xl font-extrabold text-primary">\${{ selectedItem()!.price.toFixed(2) }}</div>

          <!-- Quantity Selector -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Quantity</label>
            <div class="flex items-center gap-3">
              <button (click)="decreaseQty()" [disabled]="modalQty <= 1"
                class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-700 dark:text-white hover:bg-primary hover:text-white disabled:opacity-40 transition-all">−</button>
              <span class="w-10 text-center text-xl font-bold text-slate-800 dark:text-white">{{ modalQty }}</span>
              <button (click)="increaseQty()" [disabled]="modalQty >= 50"
                class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-700 dark:text-white hover:bg-primary hover:text-white disabled:opacity-40 transition-all">+</button>
            </div>
          </div>

          <!-- Special Instructions -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Special Instructions (optional)</label>
            <textarea
              [(ngModel)]="specialInstructions"
              placeholder="e.g. No onions, extra spicy, sauce on the side..."
              rows="2"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"></textarea>
          </div>

          <!-- Item Total -->
          <div class="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-700">
            <span class="text-sm text-slate-500">Item Total:</span>
            <span class="text-xl font-extrabold text-primary">\${{ getItemTotal() }}</span>
          </div>

          <button
            (click)="addToCart()"
            class="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
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
