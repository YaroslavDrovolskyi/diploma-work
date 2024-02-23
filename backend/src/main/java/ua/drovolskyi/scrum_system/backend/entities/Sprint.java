package ua.drovolskyi.scrum_system.backend.entities;

import jakarta.persistence.*;
import org.hibernate.type.TrueFalseConverter;

@Entity
@Table(name = "sprints")
public class Sprint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_vision", nullable = false, length = 500)
    private String goal;


    //////////////////// NEED to add @ManyToMany list of user stories

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "is_deleted", nullable = false)
    @Convert(converter = TrueFalseConverter.class)
    private Boolean isDeleted;
}
