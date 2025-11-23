package com.mymember.fitness_tracker.Controller;

import com.mymember.fitness_tracker.Dto.ReportResponseDto;
import com.mymember.fitness_tracker.Entity.Report;
import com.mymember.fitness_tracker.Enum.ReportType;
import com.mymember.fitness_tracker.Service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * Retrieves all saved historical reports for the user.
     * Maps to: GET /api/report/history
     */
    @GetMapping("/history")
    public ResponseEntity<List<ReportResponseDto>> getReportHistory(
            @RequestHeader("Authorization") String authHeader) {

        // Delegates to the service to fetch all stored Report entities and map them to DTOs
        List<ReportResponseDto> reports = reportService.getSavedReports(authHeader);

        return ResponseEntity.ok(reports);
    }

    /**
     * OPTIONAL: Endpoint to manually trigger report generation for testing/admin purposes.
     * Maps to: POST /api/report/generate?type=WEEKLY
     */
    @PostMapping("/generate")
    public ResponseEntity<ReportResponseDto> manuallyGenerateReport(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam ReportType type) {

        // NOTE: In a production environment, this is usually handled by a scheduled job.
        Report savedReport = reportService.generateAndSaveReport(authHeader, type, LocalDate.now());

        return ResponseEntity.ok(new ReportResponseDto(savedReport));
    }
}
