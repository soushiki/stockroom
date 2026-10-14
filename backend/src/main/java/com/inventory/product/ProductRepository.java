package com.inventory.product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);

    boolean existsByCategoryId(Long categoryId);

    long countByStockLessThanEqual(int stock);

    @Query("""
            select p from Product p
            join fetch p.category
            where (:search = '' or lower(p.name) like lower(concat('%', :search, '%'))
                                or lower(p.sku) like lower(concat('%', :search, '%')))
              and (:categoryId = 0L or p.category.id = :categoryId)
              and (:lowStockOnly = false or p.stock <= :threshold)
            order by p.name
            """)
    List<Product> search(@Param("search") String search,
                         @Param("categoryId") long categoryId,
                         @Param("lowStockOnly") boolean lowStockOnly,
                         @Param("threshold") int threshold);
}
