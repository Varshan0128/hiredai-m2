package com.HiredAI.heiredAi.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.HiredAI.heiredAi.Entity.UserEntity;
import com.HiredAI.heiredAi.Repository.UserRepository;

@Service
public class UserService {

	public enum ChangePasswordResult {
		SUCCESS,
		USER_NOT_FOUND,
		INVALID_CURRENT_PASSWORD,
		INVALID_NEW_PASSWORD,
		SAME_AS_CURRENT_PASSWORD
	}

	public enum ResetPasswordResult {
		SUCCESS,
		USER_NOT_FOUND,
		OTP_REQUIRED,
		OTP_EXPIRED,
		INVALID_OTP,
		INVALID_NEW_PASSWORD
	}

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
	private final JwtUtil jwtUtil;

	public UserService(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			EmailService emailService,
			JwtUtil jwtUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.emailService = emailService;
		this.jwtUtil = jwtUtil;
	}

	public String Register(String Email, String pass, String firstName, String lastName, String mobile) {

		Optional<UserEntity> user = userRepository.findByEmail(Email);
		if (user.isPresent()) {

			System.out.print("user already exits");
			return "Existing user";
		}

		UserEntity newUser = new UserEntity();
		newUser.setEmail(Email);
		newUser.setPassword(passwordEncoder.encode(pass));
		newUser.setFirstName(firstName);
		newUser.setLastName(lastName);
		newUser.setMobile(mobile);
		newUser.setUserName(firstName + " " + lastName);

		newUser.setVerified(false);

		userRepository.save(newUser);
		try {
			emailService.sendOtpEmail(newUser);
			return "Registered successfully. OTP sent to your email.";
		} catch (Exception ex) {
			return "Registered successfully, but OTP email could not be sent. Please use resend OTP.";
		}
	}

	public ResponseEntity<?> login(String email, String pass) {

		Optional<UserEntity> user = userRepository.findByEmail(email);
		if (user.isEmpty())
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("Message", "User not registered"));

		// if(!user.get().getPassword().equals(pass)) return "Invalid password";

		// ✅ Get the actual UserEntity object
		UserEntity existingUser = user.get();

		if (!existingUser.isVerified()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("Message", "Email not verified"));
		}

		if (!verifyAndNormalizePassword(existingUser, pass))
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("Message", "Invalid password"));

		String token = jwtUtil.generateToken(existingUser);

		return ResponseEntity.ok(Map.of("Message", "Login successfully",
				"token", token));
	}

	private boolean verifyAndNormalizePassword(UserEntity user, String rawPassword) {
		String storedPassword = user.getPassword();
		if (storedPassword == null || storedPassword.isBlank() || rawPassword == null) {
			return false;
		}

		// Handle values persisted with delegating prefix format.
		String normalizedHash = storedPassword.startsWith("{bcrypt}")
				? storedPassword.substring("{bcrypt}".length())
				: storedPassword;

		// Standard BCrypt path (register/reset-password flow).
		if (isBcryptHash(normalizedHash)) {
			return passwordEncoder.matches(rawPassword, normalizedHash);
		}

		// Legacy/plaintext fallback: allow once, then migrate to BCrypt.
		if (storedPassword.equals(rawPassword)) {
			user.setPassword(passwordEncoder.encode(rawPassword));
			userRepository.save(user);
			return true;
		}

		return false;
	}

	private boolean isBcryptHash(String value) {
		return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
	}

	public List<UserEntity> getAllUsers() {
		return userRepository.findAll();
	}

	private Optional<UserEntity> resolveAuthenticatedUser(UserEntity authUser) {
		if (authUser == null) {
			return Optional.empty();
		}

		if (authUser.getId() != null) {
			Optional<UserEntity> byId = userRepository.findById(authUser.getId());
			if (byId.isPresent()) {
				return byId;
			}
		}

		if (authUser.getEmail() != null && !authUser.getEmail().isBlank()) {
			return userRepository.findByEmail(authUser.getEmail());
		}

		return Optional.empty();
	}

	public Optional<UserEntity> updateCurrentUser(UserEntity authUser, String firstName, String lastName, String mobile) {
		Optional<UserEntity> userOpt = resolveAuthenticatedUser(authUser);
		if (userOpt.isEmpty()) {
			return Optional.empty();
		}

		UserEntity user = userOpt.get();
		user.setFirstName(firstName != null ? firstName.trim() : "");
		user.setLastName(lastName != null ? lastName.trim() : "");
		user.setMobile(mobile != null ? mobile.trim() : "");

		String fullName = (user.getFirstName() + " " + user.getLastName()).trim();
		if (!fullName.isBlank()) {
			user.setUserName(fullName);
		}

		userRepository.save(user);
		return Optional.of(user);
	}

	public ChangePasswordResult changeCurrentUserPassword(UserEntity authUser, String currentPassword, String newPassword) {
		Optional<UserEntity> userOpt = resolveAuthenticatedUser(authUser);
		if (userOpt.isEmpty()) {
			return ChangePasswordResult.USER_NOT_FOUND;
		}

		if (newPassword == null || newPassword.isBlank()) {
			return ChangePasswordResult.INVALID_NEW_PASSWORD;
		}

		UserEntity user = userOpt.get();
		if (!verifyAndNormalizePassword(user, currentPassword)) {
			return ChangePasswordResult.INVALID_CURRENT_PASSWORD;
		}

		if (currentPassword != null && currentPassword.equals(newPassword)) {
			return ChangePasswordResult.SAME_AS_CURRENT_PASSWORD;
		}

		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
		return ChangePasswordResult.SUCCESS;
	}

	public boolean deleteCurrentUser(UserEntity authUser) {
		Optional<UserEntity> userOpt = resolveAuthenticatedUser(authUser);
		if (userOpt.isEmpty()) {
			return false;
		}

		userRepository.delete(userOpt.get());
		return true;
	}

	public boolean sendOtpForEmail(String email) {
		if (email == null || email.isBlank()) {
			return false;
		}
		return emailService.sendOtpToEmail(email.trim());
	}

	public EmailService.OtpVerificationStatus verifyEmailOtp(String email, String otp) {
		if (email == null || email.isBlank() || otp == null || otp.isBlank()) {
			return EmailService.OtpVerificationStatus.INVALID;
		}
		return emailService.verifyOtpStatus(email.trim(), otp.trim());
	}

	public ResetPasswordResult resetPassword(String email, String otp, String newPassword) {
		if (email == null || email.isBlank()) {
			return ResetPasswordResult.USER_NOT_FOUND;
		}

		if (otp == null || otp.isBlank()) {
			return ResetPasswordResult.OTP_REQUIRED;
		}

		if (newPassword == null || newPassword.isBlank()) {
			return ResetPasswordResult.INVALID_NEW_PASSWORD;
		}

		Optional<UserEntity> userOpt = userRepository.findByEmail(email.trim());
		if (userOpt.isEmpty()) {
			return ResetPasswordResult.USER_NOT_FOUND;
		}

		UserEntity user = userOpt.get();
		if (user.getOtp() == null || user.getOtpExpiry() < System.currentTimeMillis()) {
			return ResetPasswordResult.OTP_EXPIRED;
		}

		if (!user.getOtp().equals(otp.trim())) {
			return ResetPasswordResult.INVALID_OTP;
		}

		user.setPassword(passwordEncoder.encode(newPassword));
		user.setOtp(null);
		user.setOtpExpiry(0);
		userRepository.save(user);
		return ResetPasswordResult.SUCCESS;
	}

	// public void googleLoginSuccess(Authentication authentication,
	// HttpServletResponse response) throws IOException, java.io.IOException {
	// OAuth2User auth = (OAuth2User) authentication.getPrincipal();
	// String email = auth.getAttribute("email");
	// String name = auth.getAttribute("name");
	//
	// Optional<UserEntity> existingUser = userRepository.findByEmail(email);
	// UserEntity user;
	//
	// if (existingUser.isEmpty()) {
	// user = new UserEntity();
	// user.setEmail(email);
	// user.setUserName(name);
	// user.setVerified(true);
	// user.setPassword("GOOGLE_LOGIN");
	// userRepository.save(user);
	// } else {
	// user = existingUser.get();
	// }
	//
	// // Generate JWT token
	// String token = jwtUtil.generateToken(user);
	//
	// // ✅ Redirect to frontend (replace with your actual frontend URL)
	// response.sendRedirect("${VITE_FRONTEND_URL}/home.html?token=" + token);
	// }

	public ResponseEntity<String> saveDreamJobs(String email, List<String> jobs) {

		Optional<UserEntity> userOpt = userRepository.findByEmail(email);

		if (userOpt.isEmpty()) {
			return ResponseEntity
					.status(HttpStatus.NOT_FOUND)
					.body("User not found");
		}

		UserEntity user = userOpt.get();
		user.setDreamJobs(jobs);

		userRepository.save(user);

		return ResponseEntity.ok("Dream jobs saved successfully");
	}

}
