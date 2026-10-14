export interface Category {
  id: number;
  name: string;
  productCount: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  createdAt: string;
}

export interface ProductRequest {
  name: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: number;
}

export interface ProductSummary {
  totalProducts: number;
  totalUnits: number;
  inventoryValue: number;
  lowStockCount: number;
  lowStockThreshold: number;
}

export interface ProductFilters {
  search: string;
  categoryId: number | null;
  lowStockOnly: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  errors: Record<string, string>;
}
