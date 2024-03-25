package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.entities.Status;

import java.util.List;
import java.util.Optional;

public interface StatusRepository extends JpaRepository<Status, Long> {
    Optional<Status> findByIdAndIsDeletedFalse(Long id);

    // all
    List<Status> findAllByIsDeletedFalse();
    List<Status> findAllByIsDeletedFalse(Pageable pageable);

    // all of project
    List<Status> findAllByProjectIdAndIsDeletedFalse(Long projectId);
    List<Status> findAllByProjectIdAndIsDeletedFalse(Long projectId, Pageable pageable);
}
