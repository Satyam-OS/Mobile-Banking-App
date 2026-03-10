package com.banking.account.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DepositResponse {
    private String message;
    private BigDecimal depositedAmount;
    private BigDecimal newBalance;
    private String currency;
}
