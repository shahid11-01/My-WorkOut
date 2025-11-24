package com.mymember.fitness_tracker.Entity;


import com.mymember.fitness_tracker.Enum.WorkoutStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
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

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private WorkoutStatus status = WorkoutStatus.PENDING;

    @Column(name = "text", columnDefinition = "TEXT")
    private String text;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "DATETIME", updatable = false)
    private LocalDateTime createdAt;


    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutExercise> workoutExercises = new ArrayList<>();

    public long getCompletedExercisesCount(){
        return this.workoutExercises.stream()
                .filter(WorkoutExercise:: isFullyCompleted)
                .count();
    }

    //완료률을 게산하기

    public int calculateCompletionRate() {
        int total = this.workoutExercises.size();
        if(total == 0) {
            return 0;
        }
        long completed = getCompletedExercisesCount();
        double rate = (double) completed / total * 100;
        return (int) Math.round(rate);

    }


    //워크아웃의 상태를 update하기
    public void updateStatus() {
        int total =this.workoutExercises.size();
        if(total > 0 && getCompletedExercisesCount() == total) {
            this.status = WorkoutStatus.COMPLETED;
        } else {
            this.status =WorkoutStatus.PENDING;
        }
    }


}
