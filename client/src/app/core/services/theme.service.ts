import { Injectable, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'food_delivery_theme';
  readonly isDark = signal<boolean>(false);

  constructor() {
    const savedTheme = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    this.isDark.set(initialDark);

    this.applyTheme(initialDark);

    effect(() => {
      const dark = this.isDark();
      this.applyTheme(dark);
      localStorage.setItem(this.storageKey, dark ? 'dark' : 'light');
    });
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
  }

  private applyTheme(dark: boolean): void {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

