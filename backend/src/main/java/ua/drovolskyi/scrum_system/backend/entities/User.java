package ua.drovolskyi.scrum_system.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.type.TrueFalseConverter;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserInProject;

import java.util.List;

@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //////////////// NEED to add attributes like login, email, isValid etc.
    ////////////// NEED to add timestamp of last authentication

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<UserInProject> participationInProjects;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<TaskProcessingAct> taskProcessingActs;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;

}