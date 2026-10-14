import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CategoryService } from '../core/category.service';
import { errorMessage } from '../core/errors';
import { Category, Product, ProductSummary } from '../core/models';
import { ProductService } from '../core/product.service';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-list.html'
})
export class ProductList implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly summary = signal<ProductSummary | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly search = signal('');
  protected readonly categoryId = signal<number | null>(null);
  protected readonly lowStockOnly = signal(false);

  protected readonly threshold = computed(() => this.summary()?.lowStockThreshold ?? 10);
  protected readonly filtersActive = computed(
    () => this.search().trim() !== '' || this.categoryId() !== null || this.lowStockOnly()
  );

  ngOnInit(): void {
    this.categoryService.list().subscribe({
      next: categories => this.categories.set(categories),
      error: err => this.error.set(errorMessage(err))
    });
    this.loadProducts();
    this.loadSummary();
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.loadProducts();
  }

  protected onCategory(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.categoryId.set(value === '' ? null : Number(value));
    this.loadProducts();
  }

  protected onLowStock(event: Event): void {
    this.lowStockOnly.set((event.target as HTMLInputElement).checked);
    this.loadProducts();
  }

  protected adjust(product: Product, delta: number): void {
    this.productService.adjustStock(product.id, delta).subscribe({
      next: updated => {
        this.products.update(list => list.map(p => (p.id === updated.id ? updated : p)));
        this.loadSummary();
      },
      error: err => this.error.set(errorMessage(err))
    });
  }

  protected remove(product: Product): void {
    if (!confirm(`Delete "${product.name}"?`)) {
      return;
    }
    this.productService.remove(product.id).subscribe({
      next: () => {
        this.products.update(list => list.filter(p => p.id !== product.id));
        this.loadSummary();
      },
      error: err => this.error.set(errorMessage(err))
    });
  }

  protected isLow(product: Product): boolean {
    return product.stock <= this.threshold();
  }

  protected level(product: Product): number {
    return Math.min(product.stock, 100);
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.productService
      .list({
        search: this.search(),
        categoryId: this.categoryId(),
        lowStockOnly: this.lowStockOnly()
      })
      .subscribe({
        next: products => {
          this.products.set(products);
          this.loading.set(false);
        },
        error: err => {
          this.error.set(errorMessage(err));
          this.loading.set(false);
        }
      });
  }

  private loadSummary(): void {
    this.productService.summary().subscribe({
      next: summary => this.summary.set(summary),
      error: () => this.summary.set(null)
    });
  }
}
