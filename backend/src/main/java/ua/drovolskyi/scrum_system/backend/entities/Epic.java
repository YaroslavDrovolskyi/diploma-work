package ua.drovolskyi.scrum_system.backend.entities;

import jakarta.persistence.*;
import org.hibernate.type.TrueFalseConverter;

import java.util.List;

@Entity
@Table(name = "epics")
public class Epic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 50)
    private String title;

    @Column(name = "description", nullable = true, length = 300)
    private String description;

    @OneToMany(mappedBy = "epic", fetch = FetchType.LAZY)
    private List<UserStory> userStories;


    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;
}
