package com.mymember.fitness_tracker.Dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class WorkOutRequestDto {
    private String title;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate scheduledDate;
    private String text;
}
