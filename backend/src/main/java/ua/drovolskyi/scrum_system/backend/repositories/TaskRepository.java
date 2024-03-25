package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Task;
import ua.drovolskyi.scrum_system.backend.entities.UserStory;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Optional<Task> findByIdAndIsDeletedFalse(Long id);

    // all of project
    List<Task> findAllByProjectIdAndIsDeletedFalse(Long projectId);
    List<Task> findAllByProjectIdAndIsDeletedFalse(Long projectId, Pageable pageable);

    // all of epic
    List<Task> findAllByEpicIdAndIsDeletedFalse(Long epicId);
    List<Task> findAllByEpicIdAndIsDeletedFalse(Long epicId, Pageable pageable);

    // all of user story
    List<Task> findAllByUserStoryIdAndIsDeletedFalse(Long userStoryId);
    List<Task> findAllByUserStoryIdAndIsDeletedFalse(Long userStoryId, Pageable pageable);

    // all of project&status
    List<Task> findAllByProjectIdAndStatusIdAndIsDeletedFalse(Long projectId, Long statusId);
    List<Task> findAllByProjectIdAndStatusIdAndIsDeletedFalse(Long projectId, Long statusId, Pageable pageable);

    // all of epic&status
    List<Task> findAllByEpicIdAndStatusIdAndIsDeletedFalse(Long epicId, Long statusId);
    List<Task> findAllByEpicIdAndStatusIdAndIsDeletedFalse(Long epicId, Long statusId, Pageable pageable);

    // all of user story & status
    List<Task> findAllByUserStoryIdAndStatusIdAndIsDeletedFalse(Long userStoryId, Long statusId);
    List<Task> findAllByUserStoryIdAndStatusIdAndIsDeletedFalse(Long userStoryId, Long statusId, Pageable pageable);

    // status id
}
