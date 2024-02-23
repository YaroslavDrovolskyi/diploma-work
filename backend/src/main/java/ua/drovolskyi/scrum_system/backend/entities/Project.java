package ua.drovolskyi.scrum_system.backend.entities;

import jakarta.persistence.*;
import org.hibernate.type.TrueFalseConverter;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserInProject;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserStoryInSprint;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "description", nullable = false, length = 1000)
    private String description;

    @Column(name = "product_goal", nullable = false, length = 500)
    private String productGoal;

    @Column(name = "product_vision", nullable = false, length = 500)
    private String productVision;


    @Column(name = "start_timestamp", nullable = false)
    private Instant startTimestamp;

    @Column(name = "deadline_timestamp", nullable = false)
    private Instant deadlineTimestamp;

    @Column(name = "finish_timestamp", nullable = false)
    private Instant finishTimestamp;



    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    private List<UserInProject> usersParticipation;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    private List<Epic> epics;

    @OneToMany(mappedBy = "project", fetch = FetchType.EAGER)
    private List<EstimationUnit> estimationUnits;

    @OneToMany(mappedBy = "project", fetch = FetchType.EAGER)
    private List<Status> statuses;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;



}
