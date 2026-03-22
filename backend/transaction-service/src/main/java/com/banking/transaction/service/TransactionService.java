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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository     accountRepository;
    private final AuthServiceClient     authServiceClient;
    private static final SecureRandom   random = new SecureRandom();

    @Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class)
    public TransactionResponse transfer(UUID userId, TransferRequest request) {
        log.info("Starting transfer for user {} to account {}", userId, request.getToAccountNumber());

        // ── Step 1: Verify transaction PIN ───────────────────────────────────
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

        if (sender.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new IllegalStateException("Sender account is not active");
        }
        if (receiver.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new IllegalStateException("Recipient account is not active");
        }
        if (sender.getBalance().compareTo(request.getAmount()) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        // ── Step 4: Execute transfer ─────────────────────────────────────────
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

    /**
     * Returns transaction history for a user including:
     *  - Transactions SENT by the user (outgoing — debit)
     *  - Transactions RECEIVED by the user (incoming — credit)
     *
     * The response includes a 'direction' field: "DEBIT" or "CREDIT"
     * so the frontend can display + or - correctly.
     */
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactionHistory(UUID userId, int page, int size) {
        // Get the user's account number so we can find incoming transfers
        String userAccountNumber = accountRepository.findByUserId(userId)
                .map(Account::getAccountNumber)
                .orElse(null);

        // Fetch transactions where user is the sender (by userId)
        Pageable pageable = PageRequest.of(0, 200); // fetch more, we'll sort & paginate in memory
        List<Transaction> sentTxns = transactionRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .getContent();

        // Fetch transactions where user is the receiver (by account number)
        List<Transaction> receivedTxns = userAccountNumber != null
                ? transactionRepository.findByAccountNumber(userAccountNumber)
                .stream()
                // Only include transactions where this user is the RECEIVER, not sender
                // (avoid duplicates — sent txns already captured above by userId)
                .filter(t -> !t.getUserId().equals(userId)
                        && t.getToAccountNumber().equals(userAccountNumber))
                .collect(Collectors.toList())
                : List.of();

        // Merge, mark direction, sort by date descending
        List<TransactionResponse> merged = Stream.concat(
                        sentTxns.stream().map(t -> {
                            TransactionResponse r = TransactionResponse.fromEntity(t);
                            r.setDirection("DEBIT");
                            return r;
                        }),
                        receivedTxns.stream().map(t -> {
                            TransactionResponse r = TransactionResponse.fromEntity(t);
                            r.setDirection("CREDIT");
                            // Override description to show sender info for received transfers
                            if (r.getDescription() == null || r.getDescription().startsWith("Transfer to")) {
                                r.setDescription("Received from " + t.getFromAccountNumber());
                            }
                            return r;
                        })
                )
                .sorted(Comparator.comparing(TransactionResponse::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        // Manual pagination
        int start = page * size;
        int end   = Math.min(start + size, merged.size());
        List<TransactionResponse> pageContent = start >= merged.size()
                ? List.of()
                : merged.subList(start, end);

        return new PageImpl<>(pageContent, PageRequest.of(page, size), merged.size());
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
