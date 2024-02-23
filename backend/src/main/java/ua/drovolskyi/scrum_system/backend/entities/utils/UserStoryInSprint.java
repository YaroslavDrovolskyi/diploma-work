package ua.drovolskyi.scrum_system.backend.entities.utils;

import jakarta.persistence.*;
import org.hibernate.type.TrueFalseConverter;
import ua.drovolskyi.scrum_system.backend.entities.Project;
import ua.drovolskyi.scrum_system.backend.entities.Sprint;
import ua.drovolskyi.scrum_system.backend.entities.UserStory;

@Entity
@Table(name = "user_stories_in_sprints")
public class UserStoryInSprint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_story_id", nullable = false)
    private UserStory userStory;

    @ManyToOne
    @JoinColumn(name = "sprint_id", nullable = false)
    private Sprint sprint;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;
}
