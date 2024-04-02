package ua.drovolskyi.scrum_system.backend.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import ua.drovolskyi.scrum_system.backend.dto.CreateProjectDto;
import ua.drovolskyi.scrum_system.backend.dto.EditProjectDto;
import ua.drovolskyi.scrum_system.backend.entities.Project;

@SpringBootTest
class ProjectServiceTest {
    @Autowired
    private ProjectService projectService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void createProject() {
        CreateProjectDto dto = new CreateProjectDto("name", "description", "product goal");
        Project project = projectService.createProject(dto);

//        System.out.println(objectMapper.writeValueAsString(project));
    }

    @Test
    void editProjectFull(){
        projectService.editProject(new EditProjectDto(1L, "new name", "new description", "new goal"));
    }

    @Test
    void editProjectNotFull(){
        projectService.editProject(new EditProjectDto(2L, "name", null, "goal"));
    }

    @Test
    void deleteProject(){
        projectService.deleteProject(1L);
    }
}