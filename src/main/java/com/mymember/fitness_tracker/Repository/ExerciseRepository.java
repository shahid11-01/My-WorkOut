package com.mymember.fitness_tracker.Repository;

import com.mymember.fitness_tracker.Entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByExerciseName(String exerciseName);


}
