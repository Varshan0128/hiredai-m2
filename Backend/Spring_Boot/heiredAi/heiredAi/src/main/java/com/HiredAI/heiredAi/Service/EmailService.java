package com.HiredAI.heiredAi.Service;

import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.HiredAI.heiredAi.Entity.UserEntity;
import com.HiredAI.heiredAi.Repository.UserRepository;

@Service
public class EmailService {

    public enum OtpVerificationStatus {
        SUCCESS,
        USER_NOT_FOUND,
        EXPIRED,
        INVALID
    }

    private final JavaMailSender mailSender;
    private final UserRepository userRepo;
    private final String fromAddress;

    public EmailService(
            JavaMailSender mailSender,
            UserRepository userRepo,
            @Value("${spring.mail.username:}") String fromAddress) {
        this.mailSender = mailSender;
        this.userRepo = userRepo;
        this.fromAddress = fromAddress;
    }

    // Generate random 6-digit OTP
    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    // Send OTP email
    public void sendOtpEmail(UserEntity user) {
        String otp = generateOTP();
        long expiryTime = System.currentTimeMillis() + (5 * 60 * 1000); // 5 minutes validity

        String previousOtp = user.getOtp();
        long previousOtpExpiry = user.getOtpExpiry();

        user.setOtp(otp);
        user.setOtpExpiry(expiryTime);
        userRepo.save(user);

        SimpleMailMessage message = new SimpleMailMessage();
        if (fromAddress != null && !fromAddress.isBlank()) {
            message.setFrom(fromAddress);
        }
        message.setTo(user.getEmail());
        message.setSubject("Your Verification OTP");
        message.setText("Hello " + (user.getFirstName() != null ? user.getFirstName() : "User") + ",\n\nYour OTP is: "
                + otp + "\n\nIt will expire in 5 minutes.\n\nThank you!");

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            // Revert OTP state when delivery fails to avoid keeping an unusable code in DB.
            user.setOtp(previousOtp);
            user.setOtpExpiry(previousOtpExpiry);
            userRepo.save(user);
            throw new IllegalStateException(describeMailFailure(ex), ex);
        }
    }

    private String describeMailFailure(MailException ex) {
        String message = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();

        String lower = message == null ? "" : message.toLowerCase();
        if (lower.contains("535") || lower.contains("authentication failed") || lower.contains("username and password not accepted")) {
            return withDetail("SMTP authentication failed. Verify MAIL_USERNAME and Gmail app password.", message);
        }
        if (lower.contains("starttls") || lower.contains("tls")) {
            return withDetail("SMTP TLS handshake failed. Verify mail TLS settings.", message);
        }
        if (lower.contains("connection refused") || lower.contains("timed out") || lower.contains("unknownhost")) {
            return withDetail("SMTP connection failed. Verify network access and SMTP host/port.", message);
        }
        if (message != null && !message.isBlank()) {
            return "Could not send OTP email: " + message;
        }
        return "Could not send OTP email. Check mail configuration.";
    }

    private String withDetail(String prefix, String detail) {
        if (detail == null || detail.isBlank()) {
            return prefix;
        }
        return prefix + " Details: " + detail;
    }

    public String resendOtp(String email) {
        Optional<UserEntity> user = userRepo.findByEmail(email);
        if (user.isEmpty()) {
            return "User not found!";
        }

        sendOtpEmail(user.get());
        return "Otp sent successfully";
    }

    public OtpVerificationStatus verifyOtpStatus(String email, String enteredOtp) {
        Optional<UserEntity> user = userRepo.findByEmail(email);
        if (user.isEmpty()) {
            return OtpVerificationStatus.USER_NOT_FOUND;
        }

        UserEntity existingUser = user.get();
        if (existingUser.getOtp() == null || existingUser.getOtpExpiry() < System.currentTimeMillis()) {
            return OtpVerificationStatus.EXPIRED;
        }

        if (!existingUser.getOtp().equals(enteredOtp)) {
            return OtpVerificationStatus.INVALID;
        }

        existingUser.setVerified(true);
        existingUser.setOtp(null);
        existingUser.setOtpExpiry(0);
        userRepo.save(existingUser);
        return OtpVerificationStatus.SUCCESS;
    }

    // Legacy string response helper retained for compatibility with existing callers.
    public String verifyOtp(String email, String enteredOtp) {
        OtpVerificationStatus status = verifyOtpStatus(email, enteredOtp);
        return switch (status) {
            case SUCCESS -> "Email verified successfully!";
            case USER_NOT_FOUND -> "User not found!";
            case EXPIRED -> "OTP expired! Please request a new one.";
            case INVALID -> "Invalid OTP!";
        };
    }

    public boolean sendOtpToEmail(String email) {
        Optional<UserEntity> user = userRepo.findByEmail(email);
        if (user.isEmpty()) {
            return false;
        }
        sendOtpEmail(user.get());
        return true;
    }
}
