package com.mymember.fitness_tracker.Entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long userId;

    @Column(name = "user_name", columnDefinition ="CHAR(50)", nullable = false,length = 50)
    private String userName;

    @Column(name = "email", columnDefinition = "CHAR(100)", nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "password", columnDefinition = "CHAR(255)", nullable = false, length = 255)
    private String password;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "DATETIME", updatable = false)
    private LocalDateTime createdAt;

    //관계
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Workout> workouts = new ArrayList<>();

    @OneToMany(mappedBy = "users", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Report> reports = new ArrayList<>();
}
