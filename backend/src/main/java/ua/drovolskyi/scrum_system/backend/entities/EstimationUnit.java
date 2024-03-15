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
@Table(name = "estimation_units")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class EstimationUnit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "notation", nullable = false, length = 10)
    private String notation;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;

    // default and deletable estimation units;
    // "project" field must be changed when create new project
    @Getter
    private static final List<EstimationUnit> defaultEstimationUnits = Arrays.asList(
            new EstimationUnit(null, "spt", "story-point", null, false)
    );
}
