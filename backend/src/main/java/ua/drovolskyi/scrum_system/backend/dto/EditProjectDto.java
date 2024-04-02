package ua.drovolskyi.scrum_system.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class EditProjectDto {
    @NotNull(message = "Project ID can't be null")
    private Long id;

    @Size(max = 50, message = "Name, if not null, must have max length equal to 50")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Name, if not null, must be non-empty")
    private String name;

    @Size(max = 1000, message = "Description, if not null, must have max length equal to 1000")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Description, if not null, must be non-empty")
    private String description;

    @Size(max = 500, message = "Product goal, if not null, must have max length equal to 500")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Product goal, if not null, must be non-empty")
    private String productGoal;
}
