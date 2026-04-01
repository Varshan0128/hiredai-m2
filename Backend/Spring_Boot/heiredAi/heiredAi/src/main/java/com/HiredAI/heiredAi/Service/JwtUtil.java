package com.HiredAI.heiredAi.Service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import com.HiredAI.heiredAi.Entity.UserEntity;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
	

    // 🔐 Secret key for signing (must be 32+ chars for HS256)
    private static final String SECRET_KEY_STRING = "ZMvQAaPH1XQuX588f4kOpqVYb30Cyzxv";
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET_KEY_STRING.getBytes());

    // ✅ 1. Generate token
    public String generateToken(UserEntity userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getEmail()) // user email in token
                .setIssuedAt(new Date()) // issue time
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 hour expiry
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256) // algorithm + key
                .compact(); // build token string
    }
    
    
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email) // user email in token
                .setIssuedAt(new Date()) // issue time
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 )) // 24 hour expiry
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256) // algorithm + key
                .compact(); // build token string
    }
    

    // ✅ 2. Validate token
    public boolean validateToken(String token, UserEntity userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getEmail());
    }

    // ✅ 3. Extract username/email from token
    public String extractUsername(String token) {
        return Jwts.parserBuilder() // new builder style (not deprecated)
                .setSigningKey(SECRET_KEY) // provide key for verification
                .build()
                .parseClaimsJws(token) // parse token and verify
                .getBody() // get claims (data)
                .getSubject(); // get subject (email)
				    
  }
}
