import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from './api.config';
import { Product, ProductFilters, ProductRequest, ProductSummary } from './models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/products`;

  list(filters: ProductFilters): Observable<Product[]> {
    let params = new HttpParams();
    const search = filters.search.trim();

    if (search) {
      params = params.set('search', search);
    }
    if (filters.categoryId !== null) {
      params = params.set('categoryId', filters.categoryId);
    }
    if (filters.lowStockOnly) {
      params = params.set('lowStockOnly', true);
    }

    return this.http.get<Product[]>(this.url, { params });
  }

  summary(): Observable<ProductSummary> {
    return this.http.get<ProductSummary>(`${this.url}/summary`);
  }

  get(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  create(body: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.url, body);
  }

  update(id: number, body: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.url}/${id}`, body);
  }

  adjustStock(id: number, delta: number): Observable<Product> {
    return this.http.patch<Product>(`${this.url}/${id}/stock`, { delta });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
