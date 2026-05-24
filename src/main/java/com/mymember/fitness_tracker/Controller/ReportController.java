package com.mymember.fitness_tracker.Controller;

import com.mymember.fitness_tracker.Dto.ReportResponseDto;
import com.mymember.fitness_tracker.Entity.Report;
import com.mymember.fitness_tracker.Enum.ReportType;
import com.mymember.fitness_tracker.Service.ReportService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;


    @GetMapping("/history")
    public ResponseEntity<List<ReportResponseDto>> getReportHistory(
            @RequestHeader("Authorization") String authHeader) {

        // Delegates to the service to fetch all stored Report entities and map them to DTOs
        List<ReportResponseDto> reports = reportService.getSavedReports(authHeader);

        return ResponseEntity.ok(reports);
    }

    @DeleteMapping("/report/{id}")
    public ResponseEntity<ReportResponseDto> deleteReport(@RequestHeader("Authorization") String authHeader,
                                                          @PathVariable Long id) {
        System.out.println("ReportId" + id);
        reportService.deleteReport(authHeader, id);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/generate")
    public ResponseEntity<ReportResponseDto> manuallyGenerateReport(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam ReportType type) {

        // NOTE: In a production environment, this is usually handled by a scheduled job.
        Report savedReport = reportService.generateAndSaveReport(authHeader, type, LocalDate.now());

        return ResponseEntity.ok(new ReportResponseDto(savedReport));
    }
}
