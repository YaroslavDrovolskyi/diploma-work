package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.entities.MeetingType;

import java.util.List;
import java.util.Optional;

public interface MeetingTypeRepository extends JpaRepository<MeetingType, Long> {
    Optional<MeetingType> findByIdAndIsDeletedFalse(Long id);

    // all
    List<MeetingType> findAllByIsDeletedFalse(Sort sort);
    Page<MeetingType> findAllByIsDeletedFalse(Pageable pageable);

    // all of project
    List<MeetingType> findAllByProjectIdAndIsDeletedFalse(Long projectId, Sort sort);
    Page<MeetingType> findAllByProjectIdAndIsDeletedFalse(Long projectId, Pageable pageable);
}
