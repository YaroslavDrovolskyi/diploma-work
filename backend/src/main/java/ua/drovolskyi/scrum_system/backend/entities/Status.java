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

    @Column(name = "index", nullable = false)
    private Integer index; // mean sequence number of this status among other statuses of its project

    @Column(name = "title", nullable = false, length = 15)
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

    // obvious and not-deletable statuses
    private static List<String> obviousStatusTitles = Arrays.asList("TO_DO", "ASSIGNED", "IN_PROGRESS", "DONE");
}

// it will be some three obvious and not-deletable statuses: to-do, assigned, in progress, done