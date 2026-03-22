package com.banking.transaction.dto;

import com.banking.transaction.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String fromAccountNumber;
    private String toAccountNumber;
    private BigDecimal amount;
    private String type;
    private String status;
    private String description;
    private String referenceNumber;
    private LocalDateTime createdAt;

    /**
     * Direction from the requesting user's perspective:
     *  "DEBIT"  — money left the user's account (they sent it)
     *  "CREDIT" — money entered the user's account (they received it)
     *
     * Set by TransactionService.getTransactionHistory() — not stored in DB.
     */
    private String direction;

    public static TransactionResponse fromEntity(Transaction transaction) {
        TransactionResponse r = new TransactionResponse();
        r.setId(transaction.getId());
        r.setFromAccountNumber(transaction.getFromAccountNumber());
        r.setToAccountNumber(transaction.getToAccountNumber());
        r.setAmount(transaction.getAmount());
        r.setType(transaction.getType().name());
        r.setStatus(transaction.getStatus().name());
        r.setDescription(transaction.getDescription());
        r.setReferenceNumber(transaction.getReferenceNumber());
        r.setCreatedAt(transaction.getCreatedAt());
        // direction is set separately by the service layer
        return r;
    }
}
