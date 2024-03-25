package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.entities.Sprint;

import java.util.List;
import java.util.Optional;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    Optional<Sprint> findByIdAndIsDeletedFalse(Long id);

    // all
    List<Sprint> findAllByIsDeletedFalse();
    List<Sprint> findAllByIsDeletedFalse(Pageable pageable);

    // all of project; NEED to sort by indexInProject
    List<Sprint> findAllByProjectIdAndIsDeletedFalse(Long projectId);
    List<Sprint> findAllByProjectIdAndIsDeletedFalse(Long projectId, Pageable pageable);

    // all of status
    List<Sprint> findAllByStatusAndIsDeletedFalse(Sprint.Status status);
    List<Sprint> findAllByStatusAndIsDeletedFalse(Sprint.Status status, Pageable pageable);

    // all of project&status; NEED to sort by indexInProject
    List<Sprint> findAllByProjectIdAndStatusAndIsDeletedFalse(Long projectId, Sprint.Status status);
    List<Sprint> findAllByProjectIdAndStatusAndIsDeletedFalse(Long projectId, Sprint.Status status, Pageable pageable);
}
