package ua.drovolskyi.scrum_system.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.type.TrueFalseConverter;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserInProject;

import java.time.Instant;
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

    @Column(name = "login", unique = true, nullable = false, length = 25)
    private String login;

    @Column(name = "name", nullable = false, length = 15)
    private String name;

    @Column(name = "surname", nullable = false, length = 20)
    private String surname;

    @Column(name = "contact_data", nullable = false, length = 100)
    private String contactData;

    @Column(name = "system_role", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private SystemRole systemRole;

    @Column(name = "last_auth_timestamp", nullable = true)
    private Instant lastAuthTimestamp;


    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<UserInProject> participationInProjects;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<TaskProcessingAct> taskProcessingActs;

    @Column(name = "is_valid", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isValid;


    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;

    // role of user in system (ADMIN, etc.). Defines what worker can do within system (what info can see, etc.)
    public static enum SystemRole{
        ADMIN, USER, GUEST
    }

}