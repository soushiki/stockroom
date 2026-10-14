package com.inventory.category;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByNameIgnoreCase(String name);

    @Query("""
            select new com.inventory.category.CategoryResponse(c.id, c.name, count(p.id))
            from Category c
            left join Product p on p.category = c
            group by c.id, c.name
            order by c.name
            """)
    List<CategoryResponse> findAllWithProductCount();
}
