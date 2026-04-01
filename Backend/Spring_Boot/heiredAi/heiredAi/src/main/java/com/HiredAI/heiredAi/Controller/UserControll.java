package com.HiredAI.heiredAi.Controller;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.HiredAI.heiredAi.Entity.UserEntity;
import com.HiredAI.heiredAi.Service.EmailService;
import com.HiredAI.heiredAi.Service.UserService;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/user")
public class UserControll {

    private final UserService userService;
    private final String authCookieName;
    private final long authCookieMaxAgeSeconds;
    private final boolean authCookieSecure;
    private final String authCookieSameSite;

    public UserControll(
            UserService userService,
            @Value("${app.auth.cookie.name:AUTH_TOKEN}") String authCookieName,
            @Value("${app.auth.cookie.max-age-seconds:86400}") long authCookieMaxAgeSeconds,
            @Value("${app.auth.cookie.secure:false}") boolean authCookieSecure,
            @Value("${app.auth.cookie.same-site:Lax}") String authCookieSameSite) {
        this.userService = userService;
        this.authCookieName = authCookieName;
        this.authCookieMaxAgeSeconds = authCookieMaxAgeSeconds;
        this.authCookieSecure = authCookieSecure;
        this.authCookieSameSite = authCookieSameSite;
    }

    @PostMapping("/register")
    public String userRegister(@RequestBody UserEntity user) {
        return userService.Register(user.getEmail(), user.getPassword(), user.getFirstName(), user.getLastName(),
                user.getMobile());
    }

    @PostMapping("/login")
    public ResponseEntity<?> userLogin(@RequestBody UserEntity user, HttpServletResponse response) {
        ResponseEntity<?> loginResponse = userService.login(user.getEmail(), user.getPassword());
        if (!loginResponse.getStatusCode().is2xxSuccessful()) {
            return loginResponse;
        }

        Object body = loginResponse.getBody();
        if (!(body instanceof Map<?, ?> payload) || !(payload.get("token") instanceof String token)) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("Message", "Login failed"));
        }

        response.addHeader(HttpHeaders.SET_COOKIE, buildAuthCookie(token, authCookieMaxAgeSeconds).toString());
        return ResponseEntity.ok(Map.of("Message", "Login successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserEntity user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("Message", "Unauthorized"));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("userName", user.getUserName());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("mobile", user.getMobile());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(Authentication authentication, @RequestBody Map<String, Object> request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserEntity user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("Message", "Unauthorized"));
        }

        String firstName = request.get("firstName") instanceof String value ? value : "";
        String lastName = request.get("lastName") instanceof String value ? value : "";
        String mobile = request.get("mobile") instanceof String value ? value : "";

        return userService.updateCurrentUser(user, firstName, lastName, mobile)
                .<ResponseEntity<?>>map(updated -> {
                    Map<String, Object> response = new LinkedHashMap<>();
                    response.put("Message", "Profile updated");
                    response.put("id", updated.getId());
                    response.put("email", updated.getEmail());
                    response.put("userName", updated.getUserName());
                    response.put("firstName", updated.getFirstName());
                    response.put("lastName", updated.getLastName());
                    response.put("mobile", updated.getMobile());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("Message", "User not found")));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody Map<String, Object> request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserEntity user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("Message", "Unauthorized"));
        }

        String currentPassword = request.get("currentPassword") instanceof String value ? value : "";
        String newPassword = request.get("newPassword") instanceof String value ? value : "";

        UserService.ChangePasswordResult result = userService.changeCurrentUserPassword(user, currentPassword, newPassword);
        return switch (result) {
            case SUCCESS -> ResponseEntity.ok(Map.of("Message", "Password updated"));
            case USER_NOT_FOUND -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("Message", "User not found"));
            case INVALID_CURRENT_PASSWORD -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("Message", "Current password is incorrect"));
            case INVALID_NEW_PASSWORD -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("Message", "New password is required"));
            case SAME_AS_CURRENT_PASSWORD -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("Message", "New password must be different"));
        };
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, Object> request) {
        String email = request.get("email") instanceof String value ? value : "";
        if (email.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("Message", "Email is required"));
        }

        try {
            boolean sent = userService.sendOtpForEmail(email);
            if (!sent) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("Message", "User not found"));
            }
            return ResponseEntity.ok(Map.of("Message", "OTP sent"));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("Message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("Message", "Could not send OTP email. Check mail configuration."));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, Object> request) {
        String email = request.get("email") instanceof String value ? value : "";
        String otp = request.get("otp") instanceof String value ? value : "";
        if (email.isBlank() || otp.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("Message", "Email and OTP are required"));
        }

        EmailService.OtpVerificationStatus status = userService.verifyEmailOtp(email, otp);
        return switch (status) {
            case SUCCESS -> ResponseEntity.ok(Map.of("Message", "Email verified"));
            case USER_NOT_FOUND -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("Message", "User not found"));
            case EXPIRED -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("Message", "OTP expired"));
            case INVALID -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("Message", "Invalid OTP"));
        };
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildAuthCookie("", 0).toString());
        return ResponseEntity.ok(Map.of("Message", "Logged out"));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteCurrentUser(Authentication authentication, HttpServletResponse response) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserEntity user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("Message", "Unauthorized"));
        }

        boolean deleted = userService.deleteCurrentUser(user);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("Message", "User not found"));
        }

        response.addHeader(HttpHeaders.SET_COOKIE, buildAuthCookie("", 0).toString());
        return ResponseEntity.ok(Map.of("Message", "Account deleted"));
    }

    @GetMapping("/list")
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/dreamJob")
    public ResponseEntity<String> dreamJob(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        List<String> jobs = (List<String>) request.get("dreamJobs");
        return userService.saveDreamJobs(email, jobs);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, Object> request) {
        String email = request.get("email") instanceof String value ? value : "";
        String otp = request.get("otp") instanceof String value ? value : "";
        String pass = request.get("password") instanceof String value ? value : "";

        UserService.ResetPasswordResult result = userService.resetPassword(email, otp, pass);
        return switch (result) {
            case SUCCESS -> ResponseEntity.ok(Map.of("Message", "Password reset successful"));
            case USER_NOT_FOUND -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("Message", "User not found"));
            case OTP_REQUIRED -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("Message", "OTP is required"));
            case OTP_EXPIRED -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("Message", "OTP expired"));
            case INVALID_OTP -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("Message", "Invalid OTP"));
            case INVALID_NEW_PASSWORD -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("Message", "New password is required"));
        };
    }

    private ResponseCookie buildAuthCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from(authCookieName, value)
                .httpOnly(true)
                .secure(authCookieSecure)
                .path("/")
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .sameSite(authCookieSameSite)
                .build();
    }
}
