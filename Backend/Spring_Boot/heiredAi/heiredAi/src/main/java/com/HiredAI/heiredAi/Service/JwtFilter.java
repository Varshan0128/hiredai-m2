package com.HiredAI.heiredAi.Service;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.HiredAI.heiredAi.Entity.UserEntity;
import com.HiredAI.heiredAi.Repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final String authCookieName;

    public JwtFilter(
            JwtUtil jwtUtil,
            UserRepository userRepository,
            @Value("${app.auth.cookie.name:AUTH_TOKEN}") String authCookieName) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.authCookieName = authCookieName;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/oauth2/")
                || path.startsWith("/login/oauth2/")
                || path.equals("/login")
                || path.equals("/api/user/login")
                || path.equals("/api/user/register")
                || path.equals("/api/user/reset-password")
                || path.equals("/api/user/send-otp")
                || path.equals("/api/user/verify-otp");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = resolveTokenFromCookie(request);
        if (token != null
                && !token.isBlank()
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String userEmail = jwtUtil.extractUsername(token);
                UserEntity user = userRepository.findByEmail(userEmail).orElse(null);

                if (user != null && jwtUtil.validateToken(token, user)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    SecurityContextHolder.clearContext();
                }
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return null;
        }

        return Arrays.stream(cookies)
                .filter(cookie -> authCookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
