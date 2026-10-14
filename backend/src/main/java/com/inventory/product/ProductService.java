package com.inventory.product;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventory.category.Category;
import com.inventory.category.CategoryRepository;
import com.inventory.common.ConflictException;
import com.inventory.common.NotFoundException;

@Service
public class ProductService {

    public static final int LOW_STOCK_THRESHOLD = 10;

    private final ProductRepository products;
    private final CategoryRepository categories;

    public ProductService(ProductRepository products, CategoryRepository categories) {
        this.products = products;
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> search(String search, Long categoryId, boolean lowStockOnly) {
        String term = search == null ? "" : search.trim();
        long category = categoryId == null ? 0L : categoryId;
        return products.search(term, category, lowStockOnly, LOW_STOCK_THRESHOLD).stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return ProductResponse.from(getOrThrow(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        String sku = normalizeSku(request.sku());
        if (products.existsBySkuIgnoreCase(sku)) {
            throw new ConflictException("SKU already in use: " + sku);
        }
        Category category = getCategoryOrThrow(request.categoryId());
        Product product = new Product(request.name().trim(), sku, request.price(), request.stock(), category);
        return ProductResponse.from(products.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getOrThrow(id);
        String sku = normalizeSku(request.sku());
        if (products.existsBySkuIgnoreCaseAndIdNot(sku, id)) {
            throw new ConflictException("SKU already in use: " + sku);
        }
        product.setName(request.name().trim());
        product.setSku(sku);
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setCategory(getCategoryOrThrow(request.categoryId()));
        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse adjustStock(Long id, StockAdjustmentRequest request) {
        Product product = getOrThrow(id);
        int next = product.getStock() + request.delta();
        if (next < 0) {
            throw new ConflictException("Stock cannot go below zero");
        }
        product.setStock(next);
        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(Long id) {
        products.delete(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public ProductSummary summary() {
        List<Product> all = products.findAll();
        long units = all.stream().mapToLong(Product::getStock).sum();
        BigDecimal value = all.stream()
                .map(product -> product.getPrice().multiply(BigDecimal.valueOf(product.getStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long lowStock = products.countByStockLessThanEqual(LOW_STOCK_THRESHOLD);
        return new ProductSummary(all.size(), units, value, lowStock, LOW_STOCK_THRESHOLD);
    }

    private Product getOrThrow(Long id) {
        return products.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
    }

    private Category getCategoryOrThrow(Long categoryId) {
        return categories.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found: " + categoryId));
    }

    private String normalizeSku(String sku) {
        return sku.trim().toUpperCase();
    }
}
