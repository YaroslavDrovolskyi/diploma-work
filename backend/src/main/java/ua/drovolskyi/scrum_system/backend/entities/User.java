package ua.drovolskyi.scrum_system.backend.entities;

import jakarta.persistence.*;
import org.hibernate.type.TrueFalseConverter;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserInProject;

import java.util.List;

@Entity
@Table(name = "users")
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