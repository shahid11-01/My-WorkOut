package com.mymember.fitness_tracker.Service;


import com.mymember.fitness_tracker.Configuration.JwtTokenProvider;
import com.mymember.fitness_tracker.Dto.WorkOutRequestDto;
import com.mymember.fitness_tracker.Entity.Users;
import com.mymember.fitness_tracker.Entity.Workout;
import com.mymember.fitness_tracker.Repository.UserRepository;
import com.mymember.fitness_tracker.Repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public Workout createWorkout(String token, WorkOutRequestDto requestDto) {
        //토큰에서 유저를 구하기
        String email = jwtTokenProvider.getEmailFromToken(token);
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));
        //워크아웃 entity과 DTO를 메핑하기

        Workout workout = new Workout();
        workout.setTitle(requestDto.getTitle());
        workout.setUser(user);

        workout.setScheduledDate(requestDto.getDate());
        workout.setText(requestDto.getText());

        return workoutRepository.save(workout);

    }

    public List<Workout> getUserWorkouts(String token) {
        //토큰에서 유저를 구하기
        String email = jwtTokenProvider.getEmailFromToken(token);
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다"));

        //워크아웃을 user_Id기반으로 찾기
        return workoutRepository.findByUser_UserId(user.getUserId());
    }

    public void deleteWorkout(String token, Long workoutId) {
        String email = jwtTokenProvider.getEmailFromToken(token);
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("워크아웃이 없습니다"));
        workoutRepository.delete(workout);

    }

}
