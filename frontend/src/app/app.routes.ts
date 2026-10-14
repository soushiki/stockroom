import { Routes } from '@angular/router';

import { CategoryList } from './categories/category-list';
import { ProductForm } from './products/product-form';
import { ProductList } from './products/product-list';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductList, title: 'Products · Stockroom' },
  { path: 'products/new', component: ProductForm, title: 'New product · Stockroom' },
  { path: 'products/:id/edit', component: ProductForm, title: 'Edit product · Stockroom' },
  { path: 'categories', component: CategoryList, title: 'Categories · Stockroom' },
  { path: '**', redirectTo: 'products' }
];
