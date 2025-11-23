package com.mymember.fitness_tracker.Service;


import com.mymember.fitness_tracker.Dto.ReportResponseDto;
import com.mymember.fitness_tracker.Entity.Report;
import com.mymember.fitness_tracker.Entity.Users;
import com.mymember.fitness_tracker.Enum.ReportType;
import com.mymember.fitness_tracker.Enum.WorkoutStatus;
import com.mymember.fitness_tracker.Repository.ReportRepository;
import com.mymember.fitness_tracker.Repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjuster;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {
    private final WorkoutRepository workoutRepository;
    private final ReportRepository reportRepository;
    private final UserAuthService userAuthService;

    public List<ReportResponseDto> getSavedReports(String authHeader) {
        Users user = userAuthService.getAuthenticatedUser(authHeader);

        List<Report> reports = reportRepository.findAllByUsersOrderByPeriodEndDesc(user);
        return reports.stream()
                .map(ReportResponseDto :: new)
                .collect(Collectors.toList());
    }

    @Transactional
    public Report generateAndSaveReport(String authHeader, ReportType type, LocalDate calculationDate) {
        Users user = userAuthService.getAuthenticatedUser(authHeader);
        LocalDate periodStart;
        LocalDate periodEnd;

        if(type == ReportType.WEEKLY) {
            periodEnd = calculationDate.with(TemporalAdjusters.previous(DayOfWeek.SUNDAY));
            periodStart = calculationDate.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        } else if( type == ReportType.MONTHLY) {
            periodEnd = calculationDate.with(TemporalAdjusters.firstDayOfMonth()).minusDays(1);
            periodStart = calculationDate.with(TemporalAdjusters.firstDayOfMonth());
        }else {
            throw new IllegalArgumentException("Invalid report type" + type);
        }
        LocalDateTime startDateTime = periodStart.atStartOfDay();
        LocalDateTime endDateTime = periodEnd.atStartOfDay().plusDays(1).minusNanos(1);
        Long totalWorkouts = workoutRepository.countByUserAndScheduledDateBetween(
                user, startDateTime, endDateTime
        );

        Long completedWorkouts = workoutRepository.countByUserAndScheduledDateBetweenAndStatus(
                user, startDateTime, endDateTime, WorkoutStatus.COMPLETED
        );

        // 3. Calculate Rate (using BigDecimal for precision)
        BigDecimal completionRate;
        if (totalWorkouts == 0) {
            completionRate = BigDecimal.ZERO;
        } else {
            BigDecimal total = new BigDecimal(totalWorkouts);
            BigDecimal completed = new BigDecimal(completedWorkouts);

            completionRate = completed.divide(total, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        // 4. Create and Save the Report Entity
        Report report = new Report();
        report.setUsers(user);
        report.setPeriodStart(periodStart);
        report.setPeriodEnd(periodEnd);
        report.setTotalWorkouts(totalWorkouts);
        report.setCompletedWorkouts(completedWorkouts);
        report.setCompletionRate(completionRate);

        return reportRepository.save(report);

    }


}
