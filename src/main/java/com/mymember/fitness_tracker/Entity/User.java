package com.mymember.fitness_tracker.Entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(name = "user_name", columnDefinition ="CHAR(50)", nullable = false,length = 50)
    private String userName;

    @Column(name = "email", columnDefinition = "CHAR(100)", nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "password", columnDefinition = "CHAR(255)", nullable = false, length = 255)
    private String password;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "DATETIME", updatable = false)
    private LocalDateTime createdAt;


}
