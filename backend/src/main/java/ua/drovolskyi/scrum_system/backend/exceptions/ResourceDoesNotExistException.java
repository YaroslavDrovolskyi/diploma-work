package ua.drovolskyi.scrum_system.backend.exceptions;

public class ResourceDoesNotExistException extends RuntimeException{

    public ResourceDoesNotExistException(String message) {
        super(message);
    }
}