package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Epic;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;

import java.util.List;
import java.util.Optional;

public interface EpicRepository extends JpaRepository<Epic, Long> {
    Optional<Epic> findByIdAndIsDeletedFalse(Long id);

    // all
    List<Epic> findAllByIsDeletedFalse();
    List<Epic> findAllByIsDeletedFalse(Pageable pageable);

    // all of project
    List<Epic> findAllByProjectIdAndIsDeletedFalse(Long projectId);
    List<Epic> findAllByProjectIdAndIsDeletedFalse(Long projectId, Pageable pageable);
}
