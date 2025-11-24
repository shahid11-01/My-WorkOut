package com.mymember.fitness_tracker.Controller;


import com.mymember.fitness_tracker.Dto.WorkOutRequestDto;
import com.mymember.fitness_tracker.Dto.WorkoutResponseDto;
import com.mymember.fitness_tracker.Entity.Workout;
import com.mymember.fitness_tracker.Service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    public ResponseEntity<WorkoutResponseDto> createWorkout(@RequestHeader ("Authorization") String authHeader,
                                                            @RequestBody WorkOutRequestDto workoutRequestDto) {

        Workout createdWorkOut = workoutService.createWorkout(authHeader, workoutRequestDto);

        return ResponseEntity.ok(new WorkoutResponseDto(createdWorkOut));
    }

    @GetMapping("/workouts/list")
    public ResponseEntity<List<WorkoutResponseDto>> listUserWorkouts(
        @RequestHeader("Authorization") String authHeader){
        List<Workout> workouts = workoutService.getUserWorkouts(authHeader);
        List<WorkoutResponseDto> response = workouts.stream()
                .map(WorkoutResponseDto:: new)
                .toList();
        return ResponseEntity.ok(response);

    }

    @DeleteMapping("/workouts/{id}")
    public ResponseEntity<Void> deleteWorkOut(@RequestHeader ("Authorization") String authHeader,
            @PathVariable Long id) {

        workoutService.deleteWorkout(authHeader, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/workouts")
    public ResponseEntity<List<WorkoutResponseDto>> listUserWorkoutByDate(@RequestHeader("Authorization") String authHeader,
                                                                          @RequestParam("date") LocalDate date)
    {
        List<Workout> workouts = workoutService.getUserWorkOutsByDate(authHeader, date);
        List<WorkoutResponseDto> response = workouts.stream()
                .map(WorkoutResponseDto:: new)
                .toList();
        return ResponseEntity.ok(response);

    }

}
