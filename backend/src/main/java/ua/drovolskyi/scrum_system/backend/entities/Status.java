package ua.drovolskyi.scrum_system.backend.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.type.TrueFalseConverter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

//@Data

@Entity
@Table(name = "statuses")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Status{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seq_index", nullable = false) // name of column can't be 'index'
    private Integer index; // means sequence index of this status among other statuses of its project

    @Column(name = "title", nullable = false, length = 20)
//    @JsonProperty()
    private String title;

    @Column(name = "description", nullable = false, length = 100)
    private String description;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;

    // default, obvious and not-deletable statuses
    // TO-DO must be always first, DONE must be always last
    // "project" field must be changed when create new project
    @Getter
    private static final List<Status> obviousStatuses = Arrays.asList(
            new Status(null, 0, "CANCELED", "CANCELED description", null, false),
            new Status(null, 0, "TO-DO", "TO-DO description", null, false),
            new Status(null, 1, "ASSIGNED", "ASSIGNED description", null, false),
            new Status(null, 2, "IN PROGRESS", "IN PROGRESS description", null, false),
            new Status(null, 3, "DONE", "DONE description", null, false)
    );
}

