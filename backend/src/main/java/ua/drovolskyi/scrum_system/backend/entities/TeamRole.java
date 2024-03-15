package ua.drovolskyi.scrum_system.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.type.TrueFalseConverter;

import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "team_roles")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class TeamRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 25)
    private String title;

    @Column(name = "description", nullable = false, length = 100)
    private String description;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;

    // default, obvious and not-deletable team roles
    // "project" field must be changed when create new project
    @Getter
    private static final List<TeamRole> obviousTeamRoles = Arrays.asList(
            new TeamRole(null, "Teamlead", "Teamlead description", null, false),
            new TeamRole(null, "Developer", "Developer description", null, false),
            new TeamRole(null, "Tester", "Tester description", null, false),
            new TeamRole(null, "Guest", "Guest description", null, false)
    );
}
