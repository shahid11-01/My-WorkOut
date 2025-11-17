package com.mymember.fitness_tracker.Repository;

import com.mymember.fitness_tracker.Entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

}
