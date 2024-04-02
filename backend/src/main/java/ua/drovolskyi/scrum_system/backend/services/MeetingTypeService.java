package ua.drovolskyi.scrum_system.backend.services;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import ua.drovolskyi.scrum_system.backend.dto.CreateMeetingTypeDto;
import ua.drovolskyi.scrum_system.backend.dto.EditMeetingTypeDto;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.entities.MeetingType;
import ua.drovolskyi.scrum_system.backend.entities.Project;
import ua.drovolskyi.scrum_system.backend.exceptions.ResourceDoesNotExistException;
import ua.drovolskyi.scrum_system.backend.repositories.MeetingRepository;
import ua.drovolskyi.scrum_system.backend.repositories.MeetingTypeRepository;
import ua.drovolskyi.scrum_system.backend.repositories.ProjectRepository;

import java.util.List;

@Service
public class MeetingTypeService {
    @Autowired
    private MeetingTypeRepository meetingTypeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private MeetingRepository meetingRepository;

    public MeetingType getMeetingTypeById(Long id){
        MeetingType meetingType = meetingTypeRepository.findByIdAndIsDeletedFalse(id).orElse(null);

        if(meetingType == null){
            throw new ResourceDoesNotExistException(
                    String.format("Meeting type with ID=%d does not exist", id));
        }
        return meetingType;
    }

    public List<MeetingType> getAllMeetingTypes(){
        return meetingTypeRepository.findAllByIsDeletedFalse(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Page<MeetingType> getAllMeetingTypesPage(Integer pageIndex, Integer pageSize){
        return meetingTypeRepository.findAllByIsDeletedFalse(
                PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.ASC, "id")));
    }

    public List<MeetingType> getAllMeetingTypesOfProject(Long projectId){
        return meetingTypeRepository.findAllByProjectIdAndIsDeletedFalse(projectId,
                Sort.by(Sort.Direction.ASC, "id"));
    }

    public Page<MeetingType> getAllMeetingTypesOfProjectPage(Long projectId, Integer pageIndex, Integer pageSize){
        return meetingTypeRepository.findAllByProjectIdAndIsDeletedFalse(projectId,
                PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.ASC, "id")));
    }

    @Transactional
    public MeetingType createMeetingType(CreateMeetingTypeDto dto){
        Project project = projectRepository.findByIdAndIsDeletedFalse(dto.getProjectId()).orElse(null);
        if(project == null){
            throw new ResourceDoesNotExistException(
                    String.format("Project with ID=%d does not exist", dto.getProjectId()));
        }

        MeetingType meetingType = new MeetingType();
        meetingType.setTitle(dto.getTitle());
        meetingType.setDescription(dto.getDescription());
        meetingType.setProject(project);
        meetingType.setIsDeleted(false);

        meetingTypeRepository.save(meetingType);

        return meetingType;
    }

    /**
     * Edit meeting type according to not-null fields of given DTO object
     * @param dto
     * @return
     */
    @Transactional
    public MeetingType editMeetingType(EditMeetingTypeDto dto){
        MeetingType meetingType = getMeetingTypeById(dto.getId());

        if(dto.getTitle() != null){
            meetingType.setTitle(dto.getTitle());
        }
        if(dto.getDescription() != null){
            meetingType.setDescription(dto.getDescription());
        }

        meetingTypeRepository.save(meetingType);

        return meetingType;
    }

    /**
     * Deletes meeting type, if there is no meeting of this type inside of type's project
     * @param meetingTypeId
     */
    @Transactional
    public void deleteMeetingType(Long meetingTypeId){
        MeetingType meetingType = getMeetingTypeById(meetingTypeId);
        List<Meeting> meetingsOfType = meetingRepository.findAllByProjectIdAndTypeIdAndIsDeletedFalse(
                meetingType.getProject().getId(), meetingTypeId);
        if(!meetingsOfType.isEmpty()){
            throw new IllegalArgumentException(String.format(
                    "Can't delete meeting type with ID=%d, because at least one meeting of this type exists",
                    meetingTypeId));
        }
        meetingType.setIsDeleted(true);
        meetingTypeRepository.save(meetingType);
    }
}
