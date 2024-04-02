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
public class EditMeetingTypeDto {
    @NotNull(message = "Meeting type ID can't be null")
    private Long id;

    @Size(max = 25, message = "Title must have max length equal to 25")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Title, if not null, must be non-empty")
    private String title;

    @Size(max = 100, message = "Description must have max length equal to 100")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Description, if not null, must be non-empty")
    private String description;
}
