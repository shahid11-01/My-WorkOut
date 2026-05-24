package com.mymember.fitness_tracker.Service;


import com.mymember.fitness_tracker.Configuration.JwtTokenProvider;
import com.mymember.fitness_tracker.Dto.WorkOutExerciseDto;
import com.mymember.fitness_tracker.Entity.Exercise;
import com.mymember.fitness_tracker.Entity.Users;
import com.mymember.fitness_tracker.Entity.Workout;
import com.mymember.fitness_tracker.Entity.WorkoutExercise;
import com.mymember.fitness_tracker.Enum.WorkoutStatus;
import com.mymember.fitness_tracker.Repository.ExerciseRepository;
import com.mymember.fitness_tracker.Repository.UserRepository;
import com.mymember.fitness_tracker.Repository.WorkoutExerciseRepository;
import com.mymember.fitness_tracker.Repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkoutExerciseService {

    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final WorkoutRepository workoutRepository;
    private final WorkoutService workoutService;
    private final ExerciseRepository exerciseRepository;
    private final AuthService authService;
    private final UserAuthService userAuthService;

    public WorkoutExercise addWorkoutExercise(WorkOutExerciseDto dto) {
        Workout workout = workoutRepository.findById(dto.getWorkoutId())
                .orElseThrow(() -> new IllegalArgumentException("원크아웃이 없습니다"));

        Exercise masterExercise = exerciseRepository.findById(dto.getExerciseId())
                .orElseThrow(() -> new IllegalArgumentException("마스터 운동이 없습니다 (Exercise ID: " + dto.getExerciseId() + ")"));

        WorkoutExercise ex = new WorkoutExercise();
        ex.setWorkout(workout);
        ex.setExerciseName(dto.getExerciseName());
        ex.setSets(dto.getSets());
        ex.setReps(dto.getReps());
        ex.setComment(dto.getComment());
        ex.setExercise(masterExercise);

        WorkoutExercise saved = workoutExerciseRepository.save(ex);

        workout.updateStatus();
        workoutRepository.save(workout);

        return saved;

    }
    @Transactional
    public void toggleComplete(Long workExId, boolean isMarkingComplete) {
        WorkoutExercise ex = workoutExerciseRepository.findById(workExId)
                .orElseThrow(() -> new RuntimeException("WorkOutExercise not found"));

        Long currentCompleted = ex.getCompletedSets();
        if(isMarkingComplete) {
            ex.setCompletedSets(Long.min(ex.getSets(), currentCompleted + 1));
        } else {
            ex.setCompletedSets(Long.max(0L, currentCompleted - 1));
        }
        workoutExerciseRepository.save(ex);

        Workout workout = ex.getWorkout();
        workout.updateStatus();
        workoutRepository.save(workout);

    }




    @Transactional
    public void deleteWorkoutExercise(String authHeader,Long workoutExerciseId) {

        Users user = userAuthService.getAuthenticatedUser(authHeader);


        WorkoutExercise workoutExercise = workoutExerciseRepository.findById(workoutExerciseId

        ).orElseThrow(() -> new RuntimeException("워크아웃 운동이 없습니다"));

        Workout parentWorkout = workoutExercise.getWorkout();

        if(parentWorkout == null) {

            workoutExerciseRepository.delete(workoutExercise);

            return;

        }

        if (parentWorkout.getWorkoutExercises() != null) {

            parentWorkout.getWorkoutExercises().remove(workoutExercise);

        }

        workoutExerciseRepository.delete(workoutExercise);

        parentWorkout.updateStatus();

        workoutRepository.save(parentWorkout);



    }






}
