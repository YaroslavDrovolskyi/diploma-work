package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserInProject;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserStoryInSprint;

import java.util.List;
import java.util.Optional;

public interface UserInProjectRepository extends JpaRepository<UserInProject, Long> {
    Optional<UserInProject> findByIdAndIsDeletedFalse(Long id);

    // all of project
    List<UserInProject> findAllByProjectIdAndIsDeletedFalse(Long projectId);
    List<UserInProject> findAllByProjectIdAndIsDeletedFalse(Long projectId, Pageable pageable);

    // all of user
    List<UserInProject> findAllByUserIdAndIsDeletedFalse(Long userId);
    List<UserInProject> findAllByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);
}
