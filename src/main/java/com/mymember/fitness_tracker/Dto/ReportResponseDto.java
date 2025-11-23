package com.mymember.fitness_tracker.Dto;


import com.mymember.fitness_tracker.Entity.Report;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@NoArgsConstructor
public class ReportResponseDto {

    private Long reportId;
    private String reportType;
    private String periodDisplay;
    private BigDecimal completionRate;
    private Long totalWorkouts;
    private Long completedWorkouts;
    private Long uncompletedWorkouts;

    public ReportResponseDto(Report report) {
        this.reportId =report.getReportId();
        this.reportType = report.getReportTypeDisplayName();
        this.completionRate = report.getCompletionRate();
        this.totalWorkouts = report.getTotalWorkouts();
        this.completedWorkouts = report.getCompletedWorkouts();

        this.uncompletedWorkouts = report.getTotalWorkouts() - report.getCompletedWorkouts();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM월 DD일");
        this.periodDisplay = String.format("%s ~ %s",
                report.getPeriodStart().format(formatter),
                report.getPeriodEnd().format(formatter));
    }


}
