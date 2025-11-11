package com.mymember.fitness_tracker.Enum;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum WorkoutStatus {
    PENDING("미완료"),
    COMPLETED("완료");

    private  final String displayName;



}
