package ua.drovolskyi.scrum_system.backend.services;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import ua.drovolskyi.scrum_system.backend.dto.CreateMeetingTypeDto;
import ua.drovolskyi.scrum_system.backend.dto.EditMeetingTypeDto;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MeetingTypeServiceTest {
    @Autowired
    private MeetingTypeService meetingTypeService;

    @Test
    void createMeetingType() {
        CreateMeetingTypeDto dto = new CreateMeetingTypeDto("title", "description", 1L);
        meetingTypeService.createMeetingType(dto);
    }

    @Test
    void editMeetingType() {
        EditMeetingTypeDto dto = new EditMeetingTypeDto(6L, null, "new description");
        meetingTypeService.editMeetingType(dto);
    }

    @Test
    void deleteMeetingType() {
        meetingTypeService.deleteMeetingType(1L);
    }
}