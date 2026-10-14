import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CategoryService } from '../core/category.service';
import { errorMessage } from '../core/errors';
import { Category, ProductRequest } from '../core/models';
import { ProductService } from '../core/product.service';

type FieldName = 'name' | 'sku' | 'price' | 'stock' | 'categoryId';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html'
})
export class ProductForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly productId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly isEdit = computed(() => this.productId() !== null);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    sku: ['', [Validators.required, Validators.maxLength(40)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    categoryId: [0, [Validators.min(1)]]
  });

  ngOnInit(): void {
    this.categoryService.list().subscribe({
      next: categories => this.categories.set(categories),
      error: err => this.error.set(errorMessage(err))
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.productId.set(Number(id));
      this.productService.get(Number(id)).subscribe({
        next: product =>
          this.form.setValue({
            name: product.name,
            sku: product.sku,
            price: product.price,
            stock: product.stock,
            categoryId: product.categoryId
          }),
        error: err => this.error.set(errorMessage(err))
      });
    }
  }

  protected showError(field: FieldName): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const body: ProductRequest = this.form.getRawValue();
    const id = this.productId();
    const request$ =
      id === null ? this.productService.create(body) : this.productService.update(id, body);

    request$.subscribe({
      next: () => void this.router.navigate(['/products']),
      error: err => {
        this.error.set(errorMessage(err));
        this.saving.set(false);
      }
    });
  }
}
