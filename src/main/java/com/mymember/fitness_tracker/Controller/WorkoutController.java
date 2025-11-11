package com.mymember.fitness_tracker.Controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workout")
public class WorkoutController {

    @GetMapping("/hello")
    public String helloProtected() {
        return "If you can see this, you are authenticated";
    }
}
