package com.mymember.fitness_tracker.Service;


import com.mymember.fitness_tracker.Dto.LoginRequestDto;
import com.mymember.fitness_tracker.Dto.RegisterRequestDto;
import com.mymember.fitness_tracker.Entity.Users;
import com.mymember.fitness_tracker.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        return "placeholder-jwt-token-for-" +loginRequestDto.getEmail();
    }

}
