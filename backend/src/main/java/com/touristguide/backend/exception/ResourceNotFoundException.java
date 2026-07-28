package com.touristguide.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
/* basically  "error type" that we invented,
specifically for the situation of "someone asked for something that doesn't exist."*/

public class ResourceNotFoundException extends RuntimeException {

    // "extends RuntimeException" means this class inherits everything a normal exception can do,
    public ResourceNotFoundException(String message) {
        super(message);
    }
}