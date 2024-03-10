package ua.drovolskyi.scrum_system.backend.entities.utils;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.type.TrueFalseConverter;
import ua.drovolskyi.scrum_system.backend.entities.*;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "users_in_projects")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
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

    // Scrum roles
    @ElementCollection(targetClass = ScrumRole.class)
    @CollectionTable
    @Enumerated(EnumType.STRING) // https://stackoverflow.com/a/61282876
    private List<ScrumRole> scrumRoles;

    // team roles
    @OneToMany(mappedBy = "userInProject", fetch = FetchType.LAZY)
    private List<TeamRoleOfUserInProject> teamRoles;


    @Column(name = "planned_capacity", nullable = false)
    private Integer plannedCapacity;

    @Column(name = "real_capacity", nullable = true)
    private Integer realCapacity;

    @Column(name = "joined_timestamp", nullable = false)
    private Instant joinedTimestamp;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;
}
