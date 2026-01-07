package com.app.banking.auth_service.controller;

import com.app.banking.auth_service.dto.OtpRequest;
import com.app.banking.auth_service.dto.OtpResponse;
import com.app.banking.auth_service.dto.OtpVerifyRequest;
import com.app.banking.auth_service.service.OtpService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/otp")
@CrossOrigin(origins = "*") // VERY IMPORTANT for Expo
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }


    @PostMapping("/send")
    public OtpResponse sendOtp(@RequestBody(required = false) OtpRequest request) {

        if (request == null || request.getPhone() == null || request.getPhone().isBlank()) {
            System.out.println("EMPTY OTP REQUEST RECEIVED – IGNORING");
            return new OtpResponse("Ignored empty request");
        }

        System.out.println(" OTP REQUEST RECEIVED FOR: " + request.getPhone());
        otpService.sendOtp(request.getPhone());

        return new OtpResponse("OTP sent successfully");
    }



    @PostMapping("/verify")
    public OtpResponse verifyOtp(@RequestBody OtpVerifyRequest request) {
        otpService.verifyOtp(request.getPhone(), request.getOtp());
        return new OtpResponse("OTP verified successfully");
    }
}




//    @PostMapping("/verify")
//    public OtpResponse verifyOtp(@RequestBody OtpVerifyRequest request) {
//
//        otpService.verifyOtp(request.getPhone(), request.otp());
//
//        List<GrantedAuthority> authorities =
//                List.of(new SimpleGrantedAuthority("ROLE_GUEST"));
//
//        //String token = jwtUtil.generateToken(request.getPhone(), authorities);
//
//        //return new OtpResponse("Guest authenticated", token);
//        return ResponseEntity.ok(Map.of(
//                "status", "VERIFIED",
//                "message", "OTP verified successfully"
//        ));
//
//    }



