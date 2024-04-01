package ua.drovolskyi.scrum_system.backend;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.entities.MeetingType;
import ua.drovolskyi.scrum_system.backend.entities.Project;
import ua.drovolskyi.scrum_system.backend.entities.Status;
import ua.drovolskyi.scrum_system.backend.repositories.ProjectRepository;
import ua.drovolskyi.scrum_system.backend.services.ProjectService;

import java.time.ZoneId;

@SpringBootApplication
public class BackendApplication {

    private static ProjectRepository projectRepository;
    private static ProjectService projectService;

    @Autowired
    private ProjectRepository projectRepositoryAutowired;
    @Autowired
    private ProjectService projectServiceAutowired;

    @PostConstruct
    private void init() {
        projectRepository = this.projectRepositoryAutowired;
        projectService = this.projectServiceAutowired;
    }


    public static void main(String[] args) throws JsonProcessingException {
        SpringApplication.run(BackendApplication.class, args);

//        ObjectMapper objectMapper = new ObjectMapper();
//        objectMapper.registerModule(new JavaTimeModule());
//        objectMapper.findAndRegisterModules();


//        CreateProjectDto dto = new CreateProjectDto("name", "description", "product goal");
//        Project project = projectService.createProject(dto);

//        System.out.println(objectMapper.writeValueAsString(project));

//        Integer a = null;
        /*
        Integer a = Integer.valueOf(10);
        Integer b = a;
        System.out.println("Before:");
        System.out.println("a = " + toString(a));
        System.out.println("b = " + toString(b));

        a = 20;
        System.out.println("\n\nAfter:");
        System.out.println("a = " + toString(a));
        System.out.println("b = " + toString(b));

        System.out.println(Utils.getCurrentTimestamp());

         */

//        System.out.println("Available zone IDs: " + ZoneId.getAvailableZoneIds());
//        System.out.println("System default zone ID: " + ZoneId.systemDefault());


        /*
        Project p = projectRepository.findByIdAndIsDeletedFalse(1L).orElse(null);

        if (p == null){
            System.out.println("project is null");
        }
        else{
            System.out.println(p.getName());
        }

         */

/*        ObjectMapper objectMapper = new ObjectMapper();

        Status status = new Status(100L, 1, "32453", "description", null, false);
        System.out.println(status.getTitle());
        //Status status = new Status();

        String stringStatus = objectMapper.writeValueAsString(status);
        System.out.println(stringStatus);

 */
    }

    public static String toString(Integer n){
        if(n==null){
            return "null";
        }
        return n.toString();
    }

}

// Example: https://github.com/YaroslavDrovolskyi/information-systems/tree/develop/backend/src/main/java/ua/drovolskyi/is/backend
// https://github.com/YaroslavDrovolskyi/se-project/blob/backend/backend/src/main/java/ua/drovolskyi/se/backend/entities/User.java
// https://spring.io/guides/gs/accessing-data-mysql
