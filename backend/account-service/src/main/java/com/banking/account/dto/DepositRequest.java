package com.banking.account.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DepositRequest {
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Minimum deposit is ₹1")
    private BigDecimal amount;
}
