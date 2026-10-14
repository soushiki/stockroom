package com.inventory.category;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventory.common.ConflictException;
import com.inventory.common.NotFoundException;
import com.inventory.product.ProductRepository;

@Service
public class CategoryService {

    private final CategoryRepository categories;
    private final ProductRepository products;

    public CategoryService(CategoryRepository categories, ProductRepository products) {
        this.categories = categories;
        this.products = products;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categories.findAllWithProductCount();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().trim();
        if (categories.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Category already exists: " + name);
        }
        Category saved = categories.save(new Category(name));
        return new CategoryResponse(saved.getId(), saved.getName(), 0L);
    }

    @Transactional
    public void delete(Long id) {
        Category category = categories.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found: " + id));
        if (products.existsByCategoryId(id)) {
            throw new ConflictException("Category still has products");
        }
        categories.delete(category);
    }
}
