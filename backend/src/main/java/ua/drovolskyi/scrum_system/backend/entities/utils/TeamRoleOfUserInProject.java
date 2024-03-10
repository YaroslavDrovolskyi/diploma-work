package ua.drovolskyi.scrum_system.backend.entities.utils;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.type.TrueFalseConverter;
import ua.drovolskyi.scrum_system.backend.entities.Project;
import ua.drovolskyi.scrum_system.backend.entities.TeamRole;

@Entity
@Table(name = "team_roles_of_users_in_projects")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class TeamRoleOfUserInProject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_role_id", nullable = false)
    private TeamRole teamRole;

    @ManyToOne
    @JoinColumn(name = "user_in_project_id", nullable = false)
    private UserInProject userInProject;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;
}
