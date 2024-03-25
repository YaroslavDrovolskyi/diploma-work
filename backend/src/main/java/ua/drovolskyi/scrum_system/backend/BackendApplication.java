package ua.drovolskyi.scrum_system.backend;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.entities.MeetingType;
import ua.drovolskyi.scrum_system.backend.entities.Project;
import ua.drovolskyi.scrum_system.backend.entities.Status;
import ua.drovolskyi.scrum_system.backend.repositories.ProjectRepository;

@SpringBootApplication
public class BackendApplication {

    private static ProjectRepository projectRepository;

    @Autowired
    private ProjectRepository projectRepositoryAutowired;

    @PostConstruct
    private void init() {
        projectRepository = this.projectRepositoryAutowired;
    }


    public static void main(String[] args) throws JsonProcessingException {
        SpringApplication.run(BackendApplication.class, args);

        Project p = projectRepository.findByIdAndIsDeletedFalse(1L).orElse(null);

        if (p == null){
            System.out.println("project is null");
        }
        else{
            System.out.println(p.getName());
        }

/*        ObjectMapper objectMapper = new ObjectMapper();

        Status status = new Status(100L, 1, "32453", "description", null, false);
        System.out.println(status.getTitle());
        //Status status = new Status();

        String stringStatus = objectMapper.writeValueAsString(status);
        System.out.println(stringStatus);

 */
    }

}

// Example: https://github.com/YaroslavDrovolskyi/information-systems/tree/develop/backend/src/main/java/ua/drovolskyi/is/backend
// https://github.com/YaroslavDrovolskyi/se-project/blob/backend/backend/src/main/java/ua/drovolskyi/se/backend/entities/User.java
// https://spring.io/guides/gs/accessing-data-mysql
