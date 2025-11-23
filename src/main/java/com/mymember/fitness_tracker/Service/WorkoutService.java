package com.mymember.fitness_tracker.Service;


import com.mymember.fitness_tracker.Configuration.JwtTokenProvider;
import com.mymember.fitness_tracker.Dto.WorkOutRequestDto;
import com.mymember.fitness_tracker.Entity.Users;
import com.mymember.fitness_tracker.Entity.Workout;
import org.hibernate.Hibernate;
import com.mymember.fitness_tracker.Repository.UserRepository;
import com.mymember.fitness_tracker.Repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserAuthService userAuthService;


    public Workout createWorkout(String authHeader, WorkOutRequestDto requestDto) {
        //토큰에서 유저를 구하기

        Users user = userAuthService.getAuthenticatedUser(authHeader);
        //워크아웃 entity과 DTO를 메핑하기

        Workout workout = new Workout();
        workout.setTitle(requestDto.getTitle());
        workout.setUser(user);

        workout.setScheduledDate(requestDto.getScheduledDate());
        workout.setText(requestDto.getText());

        return workoutRepository.save(workout);

    }

    @Transactional(readOnly = true)
    public List<Workout> getUserWorkouts(String authHeader) {
        //토큰에서 유저를 구하기
        Users user = userAuthService.getAuthenticatedUser(authHeader);

        //워크아웃을 user_id기반으로 찾기
        List<Workout> workouts = workoutRepository.findByUser_UserId(user.getUserId());


        //트랜잭션이 닫히기 전에 지연 로딩된 컬렉션을 강제로 초기화합니다.
        for(Workout workout : workouts) {
            Hibernate.initialize(workout.getWorkoutExercises());
        }

        //초기화된 워크아웃 리스트를 반환합니다.
        return  workouts;
    }

    public void deleteWorkout(String authHeader, Long workoutId) {
       Users user = userAuthService.getAuthenticatedUser(authHeader);

        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("워크아웃이 없습니다"));
        workoutRepository.delete(workout);

    }

}
