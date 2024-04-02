package ua.drovolskyi.scrum_system.backend.dto;

import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import ua.drovolskyi.scrum_system.backend.entities.Project;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class CreateMeetingTypeDto {
    @NotBlank(message = "Title can't be blank")
    @Size(max = 25, message = "Title must have max length equal to 25")
    private String title;

    @NotBlank(message = "Description can't be blank")
    @Size(max = 100, message = "Description must have max length equal to 100")
    private String description;

    @NotNull(message = "Project ID can't be null")
    private Long projectId;
}
