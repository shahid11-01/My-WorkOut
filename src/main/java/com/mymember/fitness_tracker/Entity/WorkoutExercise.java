package com.mymember.fitness_tracker.Entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "WorkoutExercise")
public class WorkoutExercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long workExId;

    @Column(nullable = false)
    private String exerciseName;

    @Column(nullable = false)
    private Long sets;

    @Column(nullable = false)
    private Long reps;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "completed_sets")
    private Long completedSets = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_id")
    private Workout workout;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    public Long getCompletedSets() {
        return this.completedSets != null ? this.completedSets : 0L;
    }

    public boolean isFullyCompleted() {
        return this.completedSets >= this.sets;
    }

}
