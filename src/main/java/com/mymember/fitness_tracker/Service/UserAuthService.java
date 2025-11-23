package com.mymember.fitness_tracker.Service;


import com.mymember.fitness_tracker.Configuration.JwtTokenProvider;
import com.mymember.fitness_tracker.Entity.Users;
import com.mymember.fitness_tracker.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserAuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;


    private String extractToken(String authHeader) {
        if(authHeader != null && authHeader.startsWith("Bearer")) {
            return authHeader.substring(7).trim();
        }
        throw new IllegalArgumentException("Invalid or missing Authorization header.");
    }


    public Users getAuthenticatedUser(String authHeader) {
        String token = extractToken(authHeader);
        String userEmail = jwtTokenProvider.getEmailFromToken(token);

        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("인증된 유저(이메일: " + userEmail + ")를 찾을 수 없습니다."));
    }

}
