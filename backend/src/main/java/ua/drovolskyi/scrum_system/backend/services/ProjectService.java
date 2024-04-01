package ua.drovolskyi.scrum_system.backend.services;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ua.drovolskyi.scrum_system.backend.dto.CreateProjectDto;
import ua.drovolskyi.scrum_system.backend.Utils;
import ua.drovolskyi.scrum_system.backend.entities.*;
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

    public Project getById(Long id){
        Project project = projectRepository.findByIdAndIsDeletedFalse(id).orElse(null);

        if(project == null){
            throw new ResourceDoesNotExistException(
                    String.format("Project with ID=%d des not exist", id));
        }
        return project;
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


    ///// NEED to add edit project (according to not null fields of DTO), get all (with paging, and without), delete project
}
