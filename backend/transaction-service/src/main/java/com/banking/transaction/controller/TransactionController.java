package com.banking.transaction.controller;

import com.banking.transaction.dto.TransactionResponse;
import com.banking.transaction.dto.TransferRequest;
import com.banking.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/transaction")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(
            @RequestHeader("X-User-Id") String userIdStr,
            @Valid @RequestBody TransferRequest request) {
        UUID userId = UUID.fromString(userIdStr);
        TransactionResponse response = transactionService.transfer(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<TransactionResponse>> getHistory(
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = UUID.fromString(userIdStr);
        Page<TransactionResponse> response = transactionService.getTransactionHistory(userId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        TransactionResponse response = transactionService.getTransactionById(id, userId);
        return ResponseEntity.ok(response);
    }
}
