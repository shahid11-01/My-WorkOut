package com.mymember.fitness_tracker.Configuration;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationTime;

    public String generateToken(String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSignInKey())
                .compact();
    }

    /**
     * Extracts the email (username) from a JWT token.
     */
    public String getEmailFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String email = getEmailFromToken(token);
        return (email.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Validates a token without checking UserDetails (used by the filter).
     */

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().
                    setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        }catch (Exception e) {
            return false;
        }
    }

    private <T> T getClaimFromToken(String token, Function<Claims,T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    private Key getSignInKey() {
        byte[] keyBytes = this.secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    private boolean isTokenExpired(String token) {
        final Date expiration = getClaimFromToken(token, Claims::getExpiration);
        return expiration.before(new Date());
    }
}
