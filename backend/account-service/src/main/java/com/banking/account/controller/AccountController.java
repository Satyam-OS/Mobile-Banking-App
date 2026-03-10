package com.banking.account.controller;

import com.banking.account.dto.*;
import com.banking.account.service.AccountService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
@Tag(name = "Account", description = "Account management APIs")
public class AccountController {

    private final AccountService accountService;

    @Hidden
    @PostMapping("/internal/create")
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.createAccount(request));
    }

    @Operation(summary = "Deposit money into your account")
    @PostMapping("/deposit")
    public ResponseEntity<DepositResponse> deposit(
            @RequestHeader("X-User-Id") String userIdStr,
            @Valid @RequestBody DepositRequest request) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(accountService.deposit(userId, request.getAmount()));
    }

    @Operation(summary = "Get my account details")
    @GetMapping("/me")
    public ResponseEntity<AccountResponse> getMyAccount(@RequestHeader("X-User-Id") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(accountService.getAccountByUserId(userId));
    }

    @Operation(summary = "Get my balance")
    @GetMapping("/balance")
    public ResponseEntity<BalanceResponse> getBalance(@RequestHeader("X-User-Id") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        return ResponseEntity.ok(accountService.getBalance(userId));
    }

    @Operation(summary = "Freeze an account (admin)")
    @PutMapping("/freeze/{id}")
    public ResponseEntity<Void> freezeAccount(@PathVariable Long id) {
        accountService.freezeAccount(id);
        return ResponseEntity.ok().build();
    }
}
