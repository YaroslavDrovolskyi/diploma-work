package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.entities.Project;

import java.util.List;
import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    Optional<Meeting> findByIdAndIsDeletedFalse(Long id);

    // all
    List<Meeting> findAllByIsDeletedFalse();
    List<Meeting> findAllByIsDeletedFalse(Pageable pageable);

    // all of project
    List<Meeting> findAllByProjectIdAndIsDeletedFalse(Long projectId);
    List<Meeting> findAllByProjectIdAndIsDeletedFalse(Long projectId, Pageable pageable);

    // all of project&status
    List<Meeting> findAllByProjectIdAndStatusAndIsDeletedFalse(Long projectId, Meeting.Status status);
    List<Meeting> findAllByProjectIdAndStatusAndIsDeletedFalse(Long projectId, Meeting.Status status, Pageable pageable);

    // all of project&type
    List<Meeting> findAllByProjectIdAndTypeIdAndIsDeletedFalse(Long projectId, Long typeId);
    List<Meeting> findAllByProjectIdAndTypeIdAndIsDeletedFalse(Long projectId, Long typeId, Pageable pageable);
}
