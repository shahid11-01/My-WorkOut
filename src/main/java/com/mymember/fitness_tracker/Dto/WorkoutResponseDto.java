package com.mymember.fitness_tracker.Dto;

import com.mymember.fitness_tracker.Entity.Workout;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class WorkoutResponseDto {
    private Long workoutId;
    private String title;
    private int totalExercises;
    private int completedExercises;
    private int completionRate;
    private String status;
    private LocalDate scheduledDate;


    public WorkoutResponseDto(Workout workout) {
        this.workoutId = workout.getWorkoutId();
        this.title = workout.getTitle();
        this.scheduledDate = workout.getScheduledDate();
        this.status = workout.getStatus().toString();

        this.totalExercises = workout.getWorkoutExercises().size();
        this.completedExercises = (int) workout.getCompletedExercisesCount();
        this.completionRate = workout.calculateCompletionRate();
    }
}
