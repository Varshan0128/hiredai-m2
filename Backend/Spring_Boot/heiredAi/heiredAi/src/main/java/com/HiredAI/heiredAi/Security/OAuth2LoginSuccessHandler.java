package com.HiredAI.heiredAi.Security;

import java.io.IOException;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.HiredAI.heiredAi.Entity.UserEntity;
import com.HiredAI.heiredAi.Repository.UserRepository;
import com.HiredAI.heiredAi.Service.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String authCookieName;
    private final long authCookieMaxAgeSeconds;
    private final boolean authCookieSecure;
    private final String authCookieSameSite;
    private final String oauthSuccessRedirectUrl;

    public OAuth2LoginSuccessHandler(
            JwtUtil jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.auth.cookie.name:AUTH_TOKEN}") String authCookieName,
            @Value("${app.auth.cookie.max-age-seconds:86400}") long authCookieMaxAgeSeconds,
            @Value("${app.auth.cookie.secure:false}") boolean authCookieSecure,
            @Value("${app.auth.cookie.same-site:Lax}") String authCookieSameSite,
            @Value("${app.frontend.oauth2-success-url:http://localhost:3000/oauth-success}") String oauthSuccessRedirectUrl) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authCookieName = authCookieName;
        this.authCookieMaxAgeSeconds = authCookieMaxAgeSeconds;
        this.authCookieSecure = authCookieSecure;
        this.authCookieSameSite = authCookieSameSite;
        this.oauthSuccessRedirectUrl = oauthSuccessRedirectUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        String provider = authToken.getAuthorizedClientRegistrationId();
        Object principal = authentication.getPrincipal();

        String email = "";
        String name = "";

        // 1. Handle OIDC Users (Google & LinkedIn)
        if (principal instanceof org.springframework.security.oauth2.core.oidc.user.OidcUser oidcUser) {
            email = oidcUser.getEmail();
            name = oidcUser.getFullName();
        } 
        // 2. Handle standard OAuth2 Users (GitHub via your CustomOAuth2User)
        else if (principal instanceof CustomOAuth2User customUser) {
            email = customUser.getEmail();
            name = customUser.getName();
        }
        // 3. Generic Fallback
        else if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User oauth2User) {
            email = oauth2User.getAttribute("email");
            name = oauth2User.getAttribute("name");
        }

        // Safety fallback for missing email
        if (email == null || email.isBlank()) {
            email = provider + "_" + (name != null ? name.replaceAll("\\s+", "") : "user") + "@oauth-user.com";
        }

        // Find or create user
        Optional<UserEntity> existingUser = userRepository.findByEmail(email);
        UserEntity user;

        if (existingUser.isEmpty()) {
            user = new UserEntity();
            user.setEmail(email);
            user.setUserName(name != null ? name : "OAuth User");
            user.setVerified(true);
            // Store an encoded placeholder so all DB passwords remain hashed.
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            userRepository.save(user);
        } else {
            user = existingUser.get();
        }

        // Generate JWT and set secure HttpOnly cookie (do not expose token in URL).
        String jwtToken = jwtService.generateToken(user.getEmail());
        ResponseCookie authCookie = ResponseCookie.from(authCookieName, jwtToken)
                .httpOnly(true)
                .secure(authCookieSecure)
                .path("/")
                .maxAge(Duration.ofSeconds(authCookieMaxAgeSeconds))
                .sameSite(authCookieSameSite)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, authCookie.toString());

        getRedirectStrategy().sendRedirect(request, response, oauthSuccessRedirectUrl);
    }
}
