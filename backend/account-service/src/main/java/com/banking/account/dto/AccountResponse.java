package com.banking.account.dto;

import com.banking.account.entity.Account;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private UUID userId;
    private String accountNumber;
    private BigDecimal balance;
    private String status;
    private String currency;
    private LocalDateTime createdAt;

    public static AccountResponse fromEntity(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getUserId(),
                account.getAccountNumber(),
                account.getBalance(),
                account.getStatus().name(),
                account.getCurrency(),
                account.getCreatedAt()
        );
    }
}
