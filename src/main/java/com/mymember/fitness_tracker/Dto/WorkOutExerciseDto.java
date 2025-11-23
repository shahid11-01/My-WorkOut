package com.mymember.fitness_tracker.Dto;


import com.mymember.fitness_tracker.Entity.WorkoutExercise;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WorkOutExerciseDto {
    private Long workoutId;
    private Long exerciseId;
    private Long sets;
    private String exerciseName;
    private Long reps;
    private String comment;

    private Long workExId;
    private Boolean isCompleted;

    public WorkOutExerciseDto(WorkoutExercise exercise) {
        this.workExId = exercise.getWorkExId();
        this.workoutId = exercise.getWorkout().getWorkoutId();
        this.exerciseId = exercise.getExercise() != null
                ? exercise.getExercise().getExerciseId()
                : null;

        this.exerciseName = exercise.getExerciseName();
        this.sets = exercise.getSets();
        this.reps = exercise.getReps();
        this.comment = exercise.getComment();

        this.isCompleted = exercise.isCompleted();

    }
}
