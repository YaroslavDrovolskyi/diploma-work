package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.entities.Task;
import ua.drovolskyi.scrum_system.backend.entities.TaskProcessingAct;
import ua.drovolskyi.scrum_system.backend.entities.User;

import java.util.List;
import java.util.Optional;

public interface TaskProcessingActRepository extends JpaRepository<TaskProcessingAct, Long> {
    Optional<TaskProcessingAct> findByIdAndIsDeletedFalse(Long id);

    // all of task
    List<TaskProcessingAct> findAllByTaskIdAndIsDeletedFalse(Long taskId);
    List<TaskProcessingAct> findAllByTaskIdAndIsDeletedFalse(Long taskId, Pageable pageable);

    // all of user
    List<TaskProcessingAct> findAllByUserIdAndIsDeletedFalse(Long userId);
    List<TaskProcessingAct> findAllByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);

    // all of task&status
    List<TaskProcessingAct> findAllByTaskIdAndStatusIdAndIsDeletedFalse(Long taskId, Long statusId);
    List<TaskProcessingAct> findAllByTaskIdAndStatusIdAndIsDeletedFalse(Long taskId, Long statusId, Pageable pageable);

    // all of user&status
    List<TaskProcessingAct> findAllByUserIdAndStatusIdAndIsDeletedFalse(Long userId, Long statusId);
    List<TaskProcessingAct> findAllByUserIdAndStatusIdAndIsDeletedFalse(Long userId, Long statusId, Pageable pageable);
}
