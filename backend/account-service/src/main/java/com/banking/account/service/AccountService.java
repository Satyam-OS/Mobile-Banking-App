package com.banking.account.service;

import com.banking.account.dto.*;
import com.banking.account.entity.Account;
import com.banking.account.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private static final SecureRandom random = new SecureRandom();

    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        if (accountRepository.existsByUserId(request.getUserId())) {
            throw new IllegalStateException("Account already exists for this user");
        }
        Account account = new Account();
        account.setUserId(request.getUserId());
        account.setAccountNumber(generateAccountNumber());
        account.setBalance(BigDecimal.ZERO);
        account.setStatus(Account.AccountStatus.ACTIVE);
        account.setCurrency("INR");
        return AccountResponse.fromEntity(accountRepository.save(account));
    }

    @Transactional
    public DepositResponse deposit(UUID userId, BigDecimal amount) {
        Account account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new IllegalStateException("Account is not active");
        }

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        return new DepositResponse(
                "Deposit successful",
                amount,
                account.getBalance(),
                account.getCurrency()
        );
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountByUserId(UUID userId) {
        Account account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        return AccountResponse.fromEntity(account);
    }

    @Transactional(readOnly = true)
    public BalanceResponse getBalance(UUID userId) {
        Account account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        return new BalanceResponse(account.getBalance(), account.getCurrency());
    }

    @Transactional
    public void freezeAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        account.setStatus(Account.AccountStatus.FROZEN);
        accountRepository.save(account);
    }

    private String generateAccountNumber() {
        StringBuilder sb = new StringBuilder("4");
        for (int i = 0; i < 15; i++) sb.append(random.nextInt(10));
        return sb.toString();
    }
}
