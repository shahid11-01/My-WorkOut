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
    public void deleteReport(String authHeader, Long reportId) {
        System.out.println("Report id 출력 " + reportId);
        Users user = userAuthService.getAuthenticatedUser(authHeader);
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("보고서가 없습니다"));
        reportRepository.delete(report);

        System.out.println("Report Id 출략" + reportId);

    }



    @Transactional
    public Report generateAndSaveReport(String authHeader, ReportType type, LocalDate calculationDate) {
        Users user = userAuthService.getAuthenticatedUser(authHeader);
        LocalDate periodStart;
        LocalDate periodEnd;

        if(type == ReportType.WEEKLY) {
            periodStart = calculationDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
            //이번 주의 월요일로 이동
            periodStart = periodStart.plusDays(1);
            // 다음 주의 일요일에 이동
            periodEnd = periodStart.plusDays(6);
        } else if( type == ReportType.MONTHLY) {
            periodStart = calculationDate.with(TemporalAdjusters.firstDayOfMonth());
            periodEnd = calculationDate.with(TemporalAdjusters.lastDayOfMonth());
        }else {
            throw new IllegalArgumentException("Invalid report type" + type);
        }

        Long totalWorkouts = workoutRepository.countByUserAndScheduledDateBetween(
                user, periodStart, periodEnd
        );

        Long completedWorkouts = workoutRepository.countByUserAndScheduledDateBetweenAndStatus(
                user, periodStart, periodEnd, WorkoutStatus.COMPLETED
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
