package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.EstimationUnit;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;

import java.util.List;
import java.util.Optional;

public interface EstimationUnitRepository extends JpaRepository<EstimationUnit, Long> {
    Optional<EstimationUnit> findByIdAndIsDeletedFalse(Long id);

    // all
    List<EstimationUnit> findAllByIsDeletedFalse();
    List<EstimationUnit> findAllByIsDeletedFalse(Pageable pageable);

    // all for project
    List<EstimationUnit> findAllByProjectIdAndIsDeletedFalse(Long projectId);
    List<EstimationUnit> findAllByProjectIdAndIsDeletedFalse(Long projectId, Pageable pageable);



}
