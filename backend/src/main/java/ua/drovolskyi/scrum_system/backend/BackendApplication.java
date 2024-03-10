package ua.drovolskyi.scrum_system.backend;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import ua.drovolskyi.scrum_system.backend.entities.Status;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) throws JsonProcessingException {
        SpringApplication.run(BackendApplication.class, args);
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
