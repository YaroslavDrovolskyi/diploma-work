package ua.drovolskyi.scrum_system.backend.services;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import ua.drovolskyi.scrum_system.backend.dto.CreateProjectDto;
import ua.drovolskyi.scrum_system.backend.Utils;
import ua.drovolskyi.scrum_system.backend.dto.EditProjectDto;
import ua.drovolskyi.scrum_system.backend.entities.*;
import ua.drovolskyi.scrum_system.backend.entities.utils.UserInProject;
import ua.drovolskyi.scrum_system.backend.exceptions.ResourceDoesNotExistException;
import ua.drovolskyi.scrum_system.backend.repositories.*;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EstimationUnitRepository estimationUnitRepository;

    @Autowired
    private StatusRepository statusRepository;

    @Autowired
    private MeetingTypeRepository meetingTypeRepository;

    @Autowired
    private TeamRoleRepository teamRoleRepository;

    public Project getProjectById(Long id){
        Project project = projectRepository.findByIdAndIsDeletedFalse(id).orElse(null);

        if(project == null){
            throw new ResourceDoesNotExistException(
                    String.format("Project with ID=%d does not exist", id));
        }
        return project;
    }

    public List<Project> getAllProjects(){
        return projectRepository.findAllByIsDeletedFalse(Sort.by(Sort.Direction.ASC, "id"));
    }

    // pageIndex starts from 0
    public Page<Project> getAllProjectsPage(Integer pageIndex, Integer pageSize){
        return projectRepository.findAllByIsDeletedFalse(
                PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.ASC, "id")));
    }


    @Transactional
    public Project createProject(CreateProjectDto dto){
        Project project = new Project();

        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setProductGoal(dto.getProductGoal());
        project.setStartTimestamp(Utils.getCurrentTimestamp());
        project.setIsDeleted(false);
        projectRepository.save(project);

        project.setEstimationUnits(createDefaultEstimationUnits(project));
        project.setStatuses(createDefaultStatuses(project));
        project.setMeetingTypes(createDefaultMeetingTypes(project));
        project.setTeamRoles(createDefaultTeamRoles(project));

        projectRepository.save(project); // not obvious, but "just in case"

        return project;
    }


    private List<EstimationUnit> createDefaultEstimationUnits(Project project){
        List<EstimationUnit> result = new ArrayList<>();
        for(EstimationUnit u : EstimationUnit.getDefaultEstimationUnits()){
            EstimationUnit nu = new EstimationUnit(null, u.getNotation(), u.getTitle(), project, false);
            estimationUnitRepository.save(nu);
            result.add(nu);
        }
        return result;
    }

    private List<Status> createDefaultStatuses(Project project){
        List<Status> result = new ArrayList<>();
        for(Status s : Status.getObviousStatuses()){
            Status ns = new Status(null, s.getIndex(), s.getTitle(), s.getDescription(), project, false);
            statusRepository.save(ns);
            result.add(ns);
        }
        return result;
    }

    private List<MeetingType> createDefaultMeetingTypes(Project project){
        List<MeetingType> result = new ArrayList<>();
        for(MeetingType t : MeetingType.getDefaultMeetingTypes()){
            MeetingType nt = new MeetingType(null, t.getTitle(), t.getDescription(), project, false);
            meetingTypeRepository.save(nt);
            result.add(nt);
        }
        return result;
    }

    private List<TeamRole> createDefaultTeamRoles(Project project){
        List<TeamRole> result = new ArrayList<>();
        for(TeamRole r : TeamRole.getObviousTeamRoles()){
            TeamRole nr = new TeamRole(null, r.getTitle(), r.getDescription(), project, false);
            teamRoleRepository.save(nr);
            result.add(nr);
        }
        return result;
    }

    /**
     * Edit project according to not-null fields of given DTO object
     * @param dto
     * @return
     */
    @Transactional
    public Project editProject(EditProjectDto dto){
        Project project = getProjectById(dto.getId()); // if project does not exist, .getId() will throw exception

        if(dto.getName() != null){
            project.setName(dto.getName());
        }

        if(dto.getDescription() != null){
            project.setDescription(dto.getDescription());
        }

        if(dto.getProductGoal() != null){
            project.setProductGoal(dto.getProductGoal());
        }

        projectRepository.save(project);

        return project;
    }

    @Transactional
    public void deleteProject(Long projectId){
        Project project = getProjectById(projectId);

        project.setIsDeleted(true);
        projectRepository.save(project);

        // delete all objects that connected with Project
        for (UserInProject o : project.getUsersParticipation()){
//            userInProjectService.deleteUserInProject(o);
        }
        for(Epic o : project.getEpics()){ // also user stories, tasks and tasks-acts-executions will be deleted here
//            epicService.deleteEpic(o);
        }
        for(Meeting o : project.getMeetings()){
//            meetingService.deleteMeeting(o);
        }
        for(Sprint o : project.getSprints()){
//            sprintService.deleteSprint(o);
        }

        for(EstimationUnit o : project.getEstimationUnits()){
            o.setIsDeleted(true);
            estimationUnitRepository.save(o);
        }
        for(Status o : project.getStatuses()){
            o.setIsDeleted(true);
            statusRepository.save(o);
        }
        for(MeetingType o : project.getMeetingTypes()){
            o.setIsDeleted(true);
            meetingTypeRepository.save(o);
        }
        for(TeamRole o : project.getTeamRoles()){
            o.setIsDeleted(true);
            teamRoleRepository.save(o);
        }
    }
}
