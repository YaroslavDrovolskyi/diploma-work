package ua.drovolskyi.scrum_system.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.type.TrueFalseConverter;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserStoryInSprint;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "user_stories")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserStory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    @Column(name = "acpt_criteria", nullable = false, length = 3000)
    private String acceptanceCriteria;

    @Column(name = "estimation_value", nullable = true)
    private Integer estimationValue;

    @ManyToOne
    @JoinColumn(name = "estimation_unit_id", nullable = true)
    private EstimationUnit estimationUnit;

    @Column(name = "priority", nullable = false)
    private Integer priority;

    @Column(name = "created_timestamp", nullable = false)
    private Instant createdTimestamp;

    @Column(name = "edited_timestamp", nullable = false)
    private Instant editedTimestamp;


    @ManyToOne
    @JoinColumn(name = "status_id", nullable = false)
    private Status status;

    @OneToMany(mappedBy = "userStory", fetch = FetchType.LAZY)
    private List<Task> tasks;

    @OneToMany(mappedBy = "userStory", fetch = FetchType.LAZY)
    private List<UserStoryInSprint> participationInSprints;


    @ManyToOne
    @JoinColumn(name = "epic_id", nullable = false)
    private Epic epic;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;
}
