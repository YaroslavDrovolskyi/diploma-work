package ua.drovolskyi.scrum_system.backend.entities;

import jakarta.persistence.*;
import org.hibernate.type.TrueFalseConverter;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserStoryInSprint;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "sprints")
public class Sprint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "goal", nullable = false, length = 500)
    private String goal;

    @OneToMany(mappedBy = "sprint", fetch = FetchType.LAZY)
    List<UserStoryInSprint> userStoriesParticipation;


    @Column(name = "start_timestamp", nullable = false)
    private Instant startTimestamp;

    @Column(name = "deadline_timestamp", nullable = false)
    private Instant deadlineTimestamp;

    @Column(name = "finish_timestamp", nullable = false)
    private Instant finishTimestamp;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "index_in_project", nullable = false)
    private Long indexInProject;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;
}
