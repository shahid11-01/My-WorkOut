package com.mymember.fitness_tracker.Controller;


import com.mymember.fitness_tracker.Dto.WorkOutRequestDto;
import com.mymember.fitness_tracker.Entity.Workout;
import com.mymember.fitness_tracker.Service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping("/hello")
    public String helloProtected() {
        return "If you can see this, you are authenticated";
    }

    @PostMapping("/create")
    public ResponseEntity<Workout> createWorkout(@RequestHeader ("Authorization") String authHeader,
                                                 @RequestBody WorkOutRequestDto workoutRequestDto) {
        String token = authHeader.replace("Bearer", "");
        Workout createdWorkOut = workoutService.createWorkout(token, workoutRequestDto);
        return ResponseEntity.ok(createdWorkOut);
    }

    @GetMapping("/workouts")
    public ResponseEntity<List<Workout>> listUserWorkouts(
        @RequestHeader("Authorization") String authHeader){
        String token = authHeader.replace("Bearer", "");
        List<Workout> workouts = workoutService.getUserWorkouts(token);
        return ResponseEntity.ok(workouts);
    }

    @DeleteMapping("/workouts/{id}")
    public ResponseEntity<Void> deleteWorkOut(@RequestHeader ("Authorization") String authHeader,
            @PathVariable Long id) {
        String token = authHeader.replace("Bearer", "").trim();
        workoutService.deleteWorkout(token, id);
        return ResponseEntity.noContent().build();
    }

}
