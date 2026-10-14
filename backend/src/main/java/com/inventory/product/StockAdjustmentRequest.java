package com.inventory.product;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockAdjustmentRequest(
        @NotNull @Min(-1000) @Max(1000) Integer delta) {
}
