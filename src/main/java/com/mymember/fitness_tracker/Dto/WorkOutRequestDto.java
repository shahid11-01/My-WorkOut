package com.mymember.fitness_tracker.Dto;


import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class WorkOutRequestDto {
    private String title;
    private LocalDateTime date;
    private String text;
}
