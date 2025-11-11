package com.mymember.fitness_tracker.Service;


import com.mymember.fitness_tracker.Configuration.JwtTokenProvider;
import com.mymember.fitness_tracker.Dto.LoginRequestDto;
import com.mymember.fitness_tracker.Dto.RegisterRequestDto;
import com.mymember.fitness_tracker.Entity.Users;
import com.mymember.fitness_tracker.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;


    public Users registerUser(RegisterRequestDto registerRequestDto) {
        if(userRepository.findByEmail(registerRequestDto.getEmail()).isPresent()){
            throw new RuntimeException("이미 존재한 이메일입니다");
        }
        Users newUser = new Users();
        newUser.setUserName(registerRequestDto.getUserName());
        newUser.setEmail(registerRequestDto.getEmail());
        newUser.setPassword(passwordEncoder.encode(registerRequestDto.getPassword()));
        return userRepository.save(newUser);
    }


    public String loginUser(LoginRequestDto loginRequestDto) {
        // 1. Authenticate the user
        // This line tells Spring Security to check the email and password.
        // It will use your CustomUserDetailsService and PasswordEncoder automatically.
        Authentication authentication = authenticationManager.authenticate(
               new UsernamePasswordAuthenticationToken(
                       loginRequestDto.getEmail(),
                       loginRequestDto.getPassword()
               )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtTokenProvider.generateToken(authentication.getName());  // Use the email from the auth object
    }

}
