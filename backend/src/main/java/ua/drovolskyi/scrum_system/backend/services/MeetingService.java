package ua.drovolskyi.scrum_system.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import ua.drovolskyi.scrum_system.backend.entities.Meeting;
import ua.drovolskyi.scrum_system.backend.exceptions.ResourceDoesNotExistException;
import ua.drovolskyi.scrum_system.backend.repositories.MeetingRepository;

import java.util.List;

@Service
public class MeetingService {
    @Autowired
    private MeetingRepository meetingRepository;

    public Meeting getMeetingById(Long id){
        Meeting meeting = meetingRepository.findByIdAndIsDeletedFalse(id).orElse(null);

        if(meeting == null){
            throw new ResourceDoesNotExistException(
                    String.format("Meeting with ID=%d does not exist", id));
        }
        return meeting;
    }

    public List<Meeting> getAllMeetings(){
        return meetingRepository.findAllByIsDeletedFalse(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Page<Meeting> getAllMeetingsPage(Integer pageIndex, Integer pageSize){
        return meetingRepository.findAllByIsDeletedFalse(
                PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.ASC, "id")));
    }

    public List<Meeting> getAllMeetingsOfProject(Long projectId){
        return meetingRepository.findAllByProjectIdAndIsDeletedFalse(
                projectId, Sort.by(Sort.Direction.ASC, "id"));
    }

    public Page<Meeting> getAllMeetingsOfProjectPage(Long projectId, Integer pageIndex, Integer pageSize){
        return meetingRepository.findAllByProjectIdAndIsDeletedFalse(projectId,
                PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.ASC, "id")));
    }

    public List<Meeting> getAllMeetingsOfProjectOfType(Long projectId, Long meetingTypeId){
        return meetingRepository.findAllByProjectIdAndTypeIdAndIsDeletedFalse(
                projectId, meetingTypeId, Sort.by(Sort.Direction.ASC, "id"));
    }

    public Page<Meeting> getAllMeetingsOfProjectOfTypePage(Long projectId, Long meetingTypeId,
                                                           Integer pageIndex, Integer pageSize){
        return meetingRepository.findAllByProjectIdAndTypeIdAndIsDeletedFalse(projectId, meetingTypeId,
                PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.ASC, "id")));
    }
}
