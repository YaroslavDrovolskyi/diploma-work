package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Sprint;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserStoryInSprint;

import java.util.List;
import java.util.Optional;

public interface UserStoryInSprintRepository extends JpaRepository<UserStoryInSprint, Long> {
    Optional<UserStoryInSprint> findByIdAndIsDeletedFalse(Long id);

    // all of user story
    List<UserStoryInSprint> findAllByUserStoryIdAndIsDeletedFalse(Long userStoryId);
    List<UserStoryInSprint> findAllByUserStoryIdAndIsDeletedFalse(Long userStoryId, Pageable pageable);

    // all of sprint
    List<UserStoryInSprint> findAllBySprintIdAndIsDeletedFalse(Long sprintId);
    List<UserStoryInSprint> findAllBySprintIdAndIsDeletedFalse(Long sprintId, Pageable pageable);
}
