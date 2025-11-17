package com.mymember.fitness_tracker.Service;


import com.mymember.fitness_tracker.Entity.Exercise;
import com.mymember.fitness_tracker.Repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;

   public Exercise createExercise(Exercise exercise) {
       return exerciseRepository.save(exercise);
   }

   public List<Exercise> getAllExercises() {
       return exerciseRepository.findAll();
   }

   public Exercise getExerciseById(Long id) {
       return exerciseRepository.findById(id)
               .orElseThrow(() -> new RuntimeException("Exercise not found"));
   }

   public Exercise updateExercise(Long id,Exercise updatedExercise) {
       Exercise newExercise = getExerciseById(id);
       newExercise.setExerciseName(updatedExercise.getExerciseName());
       newExercise.setExerciseCategory(updatedExercise.getExerciseCategory());
       newExercise.setExerciseDescription(updatedExercise.getExerciseDescription());
       return exerciseRepository.save(newExercise);

   }

   public void deleteExercise(Long id) {
       Exercise exercise = getExerciseById(id);
       exerciseRepository.delete(exercise);
   }



}
