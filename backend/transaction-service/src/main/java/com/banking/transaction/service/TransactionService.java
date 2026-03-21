package com.banking.transaction.service;

import com.banking.transaction.client.AuthServiceClient;
import com.banking.transaction.dto.TransactionResponse;
import com.banking.transaction.dto.TransferRequest;
import com.banking.transaction.entity.Account;
import com.banking.transaction.entity.Transaction;
import com.banking.transaction.repository.AccountRepository;
import com.banking.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AuthServiceClient authServiceClient;
    private static final SecureRandom random = new SecureRandom();

    @Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class)
    public TransactionResponse transfer(UUID userId, TransferRequest request) {
        log.info("Starting transfer for user {} to account {}", userId, request.getToAccountNumber());

        // ── Step 1: Verify transaction PIN via auth-service ──────────────────
        // This call is made BEFORE acquiring any DB locks, so a bad PIN
        // returns immediately without touching account balances.
        authServiceClient.verifyTransactionPin(userId.toString(), request.getTransactionPin());
        log.info("Transaction PIN verified for user {}", userId);

        // ── Step 2: Load sender account ──────────────────────────────────────
        Account fromAccount = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Sender account not found"));

        if (fromAccount.getAccountNumber().equals(request.getToAccountNumber())) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        String fromAccNum = fromAccount.getAccountNumber();
        String toAccNum   = request.getToAccountNumber();

        // ── Step 3: Deadlock-safe ordered locking ────────────────────────────
        Account sender, receiver;
        if (fromAccNum.compareTo(toAccNum) < 0) {
            sender   = accountRepository.findByAccountNumberWithLock(fromAccNum)
                    .orElseThrow(() -> new IllegalArgumentException("Sender account not found"));
            receiver = accountRepository.findByAccountNumberWithLock(toAccNum)
                    .orElseThrow(() -> new IllegalArgumentException("Recipient account not found"));
        } else {
            receiver = accountRepository.findByAccountNumberWithLock(toAccNum)
                    .orElseThrow(() -> new IllegalArgumentException("Recipient account not found"));
            sender   = accountRepository.findByAccountNumberWithLock(fromAccNum)
                    .orElseThrow(() -> new IllegalArgumentException("Sender account not found"));
        }

        // ── Step 4: Business validations ─────────────────────────────────────
        if (sender.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new IllegalStateException("Sender account is not active");
        }
        if (receiver.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new IllegalStateException("Recipient account is not active");
        }
        if (sender.getBalance().compareTo(request.getAmount()) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        // ── Step 5: Execute transfer ─────────────────────────────────────────
        sender.setBalance(sender.getBalance().subtract(request.getAmount()));
        receiver.setBalance(receiver.getBalance().add(request.getAmount()));

        accountRepository.save(sender);
        accountRepository.save(receiver);

        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setFromAccountNumber(sender.getAccountNumber());
        transaction.setToAccountNumber(receiver.getAccountNumber());
        transaction.setAmount(request.getAmount());
        transaction.setType(Transaction.TransactionType.TRANSFER);
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);

        String desc = request.getDescription();
        transaction.setDescription(
                (desc != null && !desc.isBlank())
                        ? desc
                        : "Transfer to " + receiver.getAccountNumber()
        );
        transaction.setReferenceNumber(generateReferenceNumber());

        Transaction saved = transactionRepository.save(transaction);

        log.info("Transfer completed: ref={} amount={} from={} to={}",
                saved.getReferenceNumber(), request.getAmount(),
                sender.getAccountNumber(), receiver.getAccountNumber());

        return TransactionResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactionHistory(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(TransactionResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long transactionId, UUID userId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (!transaction.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        return TransactionResponse.fromEntity(transaction);
    }

    private String generateReferenceNumber() {
        return "TXN" + System.currentTimeMillis() + String.format("%04d", random.nextInt(10000));
    }
}
