package com.mymember.fitness_tracker.Repository;


import com.mymember.fitness_tracker.Entity.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;

public  interface  WorkoutExerciseRepository  extends JpaRepository<WorkoutExercise, Long> {

}
