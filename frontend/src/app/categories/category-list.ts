import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CategoryService } from '../core/category.service';
import { errorMessage } from '../core/errors';
import { Category } from '../core/models';

@Component({
  selector: 'app-category-list',
  imports: [ReactiveFormsModule],
  templateUrl: './category-list.html'
})
export class CategoryList implements OnInit {
  private readonly categoryService = inject(CategoryService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)]
    })
  });

  ngOnInit(): void {
    this.load();
  }

  protected add(): void {
    const name = this.form.controls.name.value.trim();
    if (!name) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.categoryService.create(name).subscribe({
      next: () => {
        this.form.reset();
        this.load();
      },
      error: err => this.error.set(errorMessage(err))
    });
  }

  protected remove(category: Category): void {
    if (!confirm(`Delete the category "${category.name}"?`)) {
      return;
    }

    this.error.set(null);
    this.categoryService.remove(category.id).subscribe({
      next: () => this.load(),
      error: err => this.error.set(errorMessage(err))
    });
  }

  private load(): void {
    this.categoryService.list().subscribe({
      next: categories => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }
}
