package ua.drovolskyi.scrum_system.backend.entities;

import jakarta.persistence.*;
import org.hibernate.type.TrueFalseConverter;

import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "meeting_types")
public class MeetingType {
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

    // default (but deletable) meeting types
    private static List<String> obviousMeetingTypeTitles = Arrays.asList(
            "Sprint planning", "Daily standup", "Spring review", "Spring retrospective", "Grooming");
}
