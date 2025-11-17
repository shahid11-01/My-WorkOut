package com.mymember.fitness_tracker.Repository;


import com.mymember.fitness_tracker.Entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public  interface WorkoutRepository extends JpaRepository<Workout, Long> {
    List<Workout> findByUser_UserId(Long userId);
}
