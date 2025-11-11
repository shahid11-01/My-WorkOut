package com.mymember.fitness_tracker.Entity;


import com.mymember.fitness_tracker.Enum.WorkoutStatus;
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
@Table(name = "Workout")
@Entity

public class Workout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "workout_id")
    private Long workoutId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(name = "title", columnDefinition = "CHAR(100)",nullable = false)
    private String title;

    @Column(name = "scheduled_date", columnDefinition = "DATETIME")
    private LocalDateTime scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private WorkoutStatus status;

    @Column(name = "text", columnDefinition = "TEXT")
    private String text;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "DATETIME", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutExercise> workoutExercises = new ArrayList<>();


}
