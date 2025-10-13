package com.everlake.api.services;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private final String secretProperty;
    private Key key;

    public JwtService(@Value("${jwt.secret:}") String secretProperty) {
        this.secretProperty = secretProperty;
    }

    @PostConstruct
    void init() {
        if (secretProperty == null || secretProperty.isBlank()) {
            throw new IllegalStateException("jwt.secret is missing. Provide a 256-bit key (base64 or raw).");
        }
        byte[] keyBytes = tryDecodeBase64OrRaw(secretProperty);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("jwt.secret is too short for HS256. Provide >= 32 bytes (256 bits).");
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + 24 * 60 * 60 * 1000L);
        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        return parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean isTokenValid(String token, String username) {
        try {
            String subject = extractUsername(token);
            return subject.equals(username) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        Date exp = parseSignedClaims(token).getPayload().getExpiration();
        return exp != null && exp.before(new Date());
    }

    private Jws<Claims> parseSignedClaims(String token) {
        JwtParser parser = Jwts.parser().verifyWith((SecretKey) key).build();
        return parser.parseSignedClaims(token);
    }

    private static byte[] tryDecodeBase64OrRaw(String value) {
        try {
            return Decoders.BASE64.decode(value);
        } catch (IllegalArgumentException ignored) {
            return value.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        }
    }
}
