package ua.drovolskyi.scrum_system.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.entities.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByIdAndIsDeletedFalse(Long id);

    Optional<User> findByLoginAndIsDeletedFalse(String login);

    // all
    List<User> findAllByIsDeletedFalse();
    List<User> findAllByIsDeletedFalse(Pageable pageable);

    // all of system role
    List<User> findAllBySystemRoleAndIsDeletedFalse(User.SystemRole systemRole);
    List<User> findAllBySystemRoleAndIsDeletedFalse(User.SystemRole systemRole, Pageable pageable);
}
