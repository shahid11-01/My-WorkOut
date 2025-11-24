package com.mymember.fitness_tracker.Controller;


import com.mymember.fitness_tracker.Dto.WorkOutExerciseDto;
import com.mymember.fitness_tracker.Entity.WorkoutExercise;
import com.mymember.fitness_tracker.Service.WorkoutExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workoutExercise")
@RequiredArgsConstructor
public class WorkoutExerciseController {

    private final WorkoutExerciseService workoutExerciseService;

    @PostMapping("/add")
    public ResponseEntity<WorkOutExerciseDto> addExercises(@RequestBody WorkOutExerciseDto dto) {
        WorkoutExercise addWorkoutExercise = workoutExerciseService.addWorkoutExercise(dto);

        return ResponseEntity.ok(new WorkOutExerciseDto(addWorkoutExercise));

    }

    @PatchMapping("/{workExId}/toggle")
    public ResponseEntity<Void> toggleExercise(@PathVariable("workExId") Long workExId,
                                               @RequestParam("complete") boolean isMarkingComplete) {
            workoutExerciseService.toggleComplete(workExId, isMarkingComplete);
            return ResponseEntity.noContent().build();

    }

    @DeleteMapping("/workOutExercises/{id}")
    public  ResponseEntity<Void> deleteWorkoutExercise(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        workoutExerciseService.deleteWorkoutExercise(authHeader,id);
        return ResponseEntity.noContent().build();

    }



}
