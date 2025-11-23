package com.mymember.fitness_tracker.Repository;


import com.mymember.fitness_tracker.Entity.Users;
import com.mymember.fitness_tracker.Entity.Workout;
import com.mymember.fitness_tracker.Enum.WorkoutStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public  interface WorkoutRepository extends JpaRepository<Workout, Long> {
    List<Workout> findByUser_UserId(Long userId);

    Long countByUserAndScheduledDateBetween(
            Users user,
            LocalDateTime periodStart,
            LocalDateTime periodEnd
    );

    Long countByUserAndScheduledDateBetweenAndStatus(
            Users user,
            LocalDateTime periodStart,
            LocalDateTime periodEnd,
            WorkoutStatus status

    );

}
