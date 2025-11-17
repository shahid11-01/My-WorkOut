package com.mymember.fitness_tracker.Controller;


import com.mymember.fitness_tracker.Dto.AuthResponseDto;
import com.mymember.fitness_tracker.Dto.LoginRequestDto;
import com.mymember.fitness_tracker.Dto.RegisterRequestDto;
import com.mymember.fitness_tracker.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequestDto registerRequestDto) {
        authService.registerUser(registerRequestDto);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginRequestDto loginRequestDto) {
        String token = authService.loginUser(loginRequestDto);
        return ResponseEntity.ok(new AuthResponseDto(token, "Login Successful"));
    }


}
