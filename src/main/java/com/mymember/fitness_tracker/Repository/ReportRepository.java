package com.mymember.fitness_tracker.Repository;

import com.mymember.fitness_tracker.Entity.Report;
import com.mymember.fitness_tracker.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByUsersOrderByPeriodEndDesc(Users user);

}
