package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Project;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByIdAndIsDeletedFalse(Long id);

    // all
    List<Project> findAllByIsDeletedFalse(Sort sort);
    Page<Project> findAllByIsDeletedFalse(Pageable pageable);
}
