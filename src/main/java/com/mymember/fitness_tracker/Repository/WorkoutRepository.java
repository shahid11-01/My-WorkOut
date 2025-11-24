package com.mymember.fitness_tracker.Repository;


import com.mymember.fitness_tracker.Entity.Users;
import com.mymember.fitness_tracker.Entity.Workout;
import com.mymember.fitness_tracker.Enum.WorkoutStatus;
import org.hibernate.jdbc.Work;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public  interface WorkoutRepository extends JpaRepository<Workout, Long> {
    List<Workout> findByUser_UserId(Long userId);

    Long countByUserAndScheduledDateBetween(
            Users user,
            LocalDate periodStart,
            LocalDate periodEnd
    );

    Long countByUserAndScheduledDateBetweenAndStatus(
            Users user,
            LocalDate periodStart,
            LocalDate periodEnd,
            WorkoutStatus status

    );

    List<Workout>findByUserAndScheduledDate(Users user, LocalDate scheduledDate);

}
