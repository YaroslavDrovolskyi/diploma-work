package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Sprint;
import ua.drovolskyi.scrum_system.backend.entities.utils.TeamRoleOfUserInProject;

import java.util.List;
import java.util.Optional;

public interface TeamRoleOfUserInProjectRepository extends JpaRepository<TeamRoleOfUserInProject, Long> {
    Optional<TeamRoleOfUserInProject> findByIdAndIsDeletedFalse(Long id);

    // all of userInProject
    List<TeamRoleOfUserInProject> findAllByUserInProjectIdAndIsDeletedFalse(Long userInProjectId);
    List<TeamRoleOfUserInProject> findAllByUserInProjectIdAndIsDeletedFalse(Long userInProjectId, Pageable pageable);

    // all of teamRole
    List<TeamRoleOfUserInProject> findAllByTeamRoleIdAndIsDeletedFalse(Long teamRoleId);
    List<TeamRoleOfUserInProject> findAllByTeamRoleIdAndIsDeletedFalse(Long teamRoleId, Pageable pageable);
}
