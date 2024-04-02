package ua.drovolskyi.scrum_system.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.type.TrueFalseConverter;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserInProject;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserStoryInSprint;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "projects")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
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

//    @Column(name = "product_vision", nullable = false, length = 500)
//    private String productVision;

    // fills automatically when project is created
    @Column(name = "start_timestamp", nullable = false)
    private Instant startTimestamp;

    // filled by teamlead
//    @Column(name = "deadline_timestamp", nullable = true)
//    private Instant deadlineTimestamp;

    // fills automatically when project is finished
//    @Column(name = "finish_timestamp", nullable = true)
//    private Instant finishTimestamp;



    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    private List<UserInProject> usersParticipation;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    private List<Epic> epics;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    private List<Meeting> meetings;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    private List<Sprint> sprints;


    @OneToMany(mappedBy = "project", fetch = FetchType.EAGER)
    private List<EstimationUnit> estimationUnits;

    @OneToMany(mappedBy = "project", fetch = FetchType.EAGER)
    private List<Status> statuses;

    @OneToMany(mappedBy = "project", fetch = FetchType.EAGER)
    private List<MeetingType> meetingTypes;

    @OneToMany(mappedBy = "project", fetch = FetchType.EAGER)
    private List<TeamRole> teamRoles;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;
}
