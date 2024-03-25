package ua.drovolskyi.scrum_system.backend.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.type.TrueFalseConverter;

import java.time.Duration;
import java.time.Instant;

@Entity
@Table(name = "meetings")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Meeting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scheduled_timestamp", nullable = false)
    private Instant scheduledTimestamp;

    @Column(name = "estimated_duration", nullable = true)
    private Duration estimatedDuration;

    @Column(name = "is_mandatory", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isMandatory;

    @Column(name = "is_offline", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isOffline;

    @Column(name = "location", nullable = false, length = 150)
    private String location; // link if online, office address/room number otherwise

    @ManyToOne
    @JoinColumn(name = "type_id", nullable = false)
    private MeetingType type;

    @Column(name = "description", nullable = false, length = 100)
    private String description;

    @Column(name = "status", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private Status status;


    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;


    public static enum Status{
        SCHEDULED, FINISHED, CANCELED
    }
}
