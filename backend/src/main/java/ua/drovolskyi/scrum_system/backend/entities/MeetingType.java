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
@Table(name = "meeting_types")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
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

    // default and deletable meeting types
    // "project" field must be changed when create new project
    @Getter
    private static final List<MeetingType> defaultMeetingTypes = Arrays.asList(
            new MeetingType(null, "Sprint planning", "Spring planning description", null, false),
            new MeetingType(null, "Daily standup", "Daily standup description", null, false),
            new MeetingType(null, "Sprint review", "Sprint review description", null, false),
            new MeetingType(null, "Sprint retrospective", "Spring retrospective description", null, false),
            new MeetingType(null, "Grooming", "Grooming description", null, false)
    );
}
