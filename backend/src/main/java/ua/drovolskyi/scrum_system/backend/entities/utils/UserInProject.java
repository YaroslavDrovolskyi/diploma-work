package ua.drovolskyi.scrum_system.backend.entities.utils;

import jakarta.persistence.*;
import org.hibernate.type.TrueFalseConverter;
import ua.drovolskyi.scrum_system.backend.entities.Project;
import ua.drovolskyi.scrum_system.backend.entities.Sprint;
import ua.drovolskyi.scrum_system.backend.entities.User;
import ua.drovolskyi.scrum_system.backend.entities.UserStory;

import java.time.Instant;

@Entity
@Table(name = "users_in_projects")
public class UserInProject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "joined_timestamp", nullable = false)
    private Instant joinedTimestamp;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;
}
