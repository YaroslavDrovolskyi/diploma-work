package ua.drovolskyi.scrum_system.backend.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class CreateProjectDto {
    @NotBlank(message = "Name can't be blank")
    @Size(max = 50, message = "Name must have max length equal to 50")
    private String name;

    @NotBlank(message = "Description can't be blank")
    @Size(max = 1000, message = "Description must have max length equal to 1000")
    private String description;

    @NotBlank(message = "Product goal can't be blank")
    @Size(max = 500, message = "Product goal must have max length equal to 500")
    private String productGoal;
}
