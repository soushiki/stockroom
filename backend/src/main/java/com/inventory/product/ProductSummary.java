package com.inventory.product;

import java.math.BigDecimal;

public record ProductSummary(
        long totalProducts,
        long totalUnits,
        BigDecimal inventoryValue,
        long lowStockCount,
        int lowStockThreshold) {
}
