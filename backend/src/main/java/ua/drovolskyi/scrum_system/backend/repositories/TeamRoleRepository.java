package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.entities.TeamRole;

import java.util.List;
import java.util.Optional;

public interface TeamRoleRepository extends JpaRepository<TeamRole, Long> {
    Optional<TeamRole> findByIdAndIsDeletedFalse(Long id);

    // all
    List<TeamRole> findAllByIsDeletedFalse();
    List<TeamRole> findAllByIsDeletedFalse(Pageable pageable);

    // all of project
    List<TeamRole> findAllByProjectIdAndIsDeletedFalse(Long projectId);
    List<TeamRole> findAllByProjectIdAndIsDeletedFalse(Long projectId, Pageable pageable);
}
