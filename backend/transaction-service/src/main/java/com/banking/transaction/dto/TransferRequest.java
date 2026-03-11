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

    // ✅ FIX: Frontend sends "note" field, backend expected "description".
    // @JsonAlias allows both field names to map to description.
    @JsonAlias("note")
    private String description;

    // ✅ FIX: Frontend sends "password" for UX purposes but backend authenticates
    // via JWT only — the password field is intentionally ignored here.
    // Jackson will silently ignore unknown fields if spring.jackson.deserialization
    // .fail-on-unknown-properties=false (which is the Spring Boot default).
}
