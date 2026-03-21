package com.banking.transaction.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequest {

    @NotBlank(message = "To account number is required")
    private String toAccountNumber;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    /** Frontend sends "note"; @JsonAlias maps it to description. */
    @JsonAlias("note")
    private String description;

    /**
     * 4-digit transaction PIN entered by the user.
     * Verified against auth-service before the transfer executes.
     * NOT stored — used only for verification in this request.
     */
    @NotBlank(message = "Transaction PIN is required")
    private String transactionPin;
}
