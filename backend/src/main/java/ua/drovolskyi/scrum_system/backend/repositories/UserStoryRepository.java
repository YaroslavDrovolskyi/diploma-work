package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.entities.Status;
import ua.drovolskyi.scrum_system.backend.entities.UserStory;

import java.util.List;
import java.util.Optional;

public interface UserStoryRepository extends JpaRepository<UserStory, Long> {
    Optional<UserStory> findByIdAndIsDeletedFalse(Long id);

    // all of project
    List<UserStory> findAllByProjectIdAndIsDeletedFalse(Long projectId);
    List<UserStory> findAllByProjectIdAndIsDeletedFalse(Long projectId, Pageable pageable);

    // all of epic
    List<UserStory> findAllByEpicIdAndIsDeletedFalse(Long epicId);
    List<UserStory> findAllByEpicIdAndIsDeletedFalse(Long epicId, Pageable pageable);

    // all of project&status
    List<UserStory> findAllByProjectIdAndStatusIdAndIsDeletedFalse(Long projectId, Long statusId);
    List<UserStory> findAllByProjectIdAndStatusIdAndIsDeletedFalse(Long projectId, Long statusId, Pageable pageable);

    // all of epic&status
    List<UserStory> findAllByEpicIdAndStatusIdAndIsDeletedFalse(Long epicId, Long statusId);
    List<UserStory> findAllByEpicIdAndStatusIdAndIsDeletedFalse(Long epicId, Long statusId, Pageable pageable);
}
