package com.mymember.fitness_tracker.Entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "Exercise")
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exercise_id")
    private Long exerciseId;

    @Column(name = "exercise_name", columnDefinition = "CHAR(100)", nullable = false)
    private String exerciseName;

    @Column(name = "exercise_category", columnDefinition = "CHAR(50)", nullable = false)
    private String exerciseCategory;

    @Column(name = "exercise_description", columnDefinition = "TEXT")
    private String exerciseDescription;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "DATETIME", updatable = false)
    private LocalDateTime exerciseCreatedAt;

    @OneToMany(mappedBy = "exercise")
    @JsonIgnore
    private List<WorkoutExercise> workoutExercises = new ArrayList<>();
}
