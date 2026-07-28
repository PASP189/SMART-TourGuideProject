package com.touristguide.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Handles image uploads for Travel Partners (and anything else that needs
 * a real "pick a file from my computer" experience instead of typing a
 * path/URL by hand).
 *
 * Files are saved to an "uploads" folder next to where the backend runs,
 * and served back out at http://localhost:8080/uploads/<filename>, which
 * is what gets stored in LocalPartner.image. Because it's a full URL, it
 * works no matter which page/server renders the <img> tag later.
 */
@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    // Folder on disk where uploaded files are physically stored.
    // IMPORTANT: this must be an ABSOLUTE path. MultipartFile.transferTo(File)
    // resolves relative paths against the servlet container's internal temp
    // work directory (e.g. .../tomcat.8080.xxxx/work/Tomcat/localhost/ROOT/),
    // not the project's working directory - using a relative path here was
    // the cause of "FileNotFoundException ... The system cannot find the
    // path specified".
    private static final Path UPLOAD_DIR =
            Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath().normalize();

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "gif", "webp");

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024; // 10MB

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file was sent."));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is too large (max 10MB)."));
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String extension = "";
        int dot = originalName.lastIndexOf('.');
        if (dot >= 0) {
            extension = originalName.substring(dot + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Only jpg, jpeg, png, gif and webp images are allowed."));
        }

        try {
            if (!Files.exists(UPLOAD_DIR)) {
                Files.createDirectories(UPLOAD_DIR);
            }

            String filename = UUID.randomUUID() + "." + extension;
            Path destination = UPLOAD_DIR.resolve(filename);
            file.transferTo(destination.toFile());

            String url = "http://localhost:8080/uploads/" + filename;
            return ResponseEntity.ok(Map.of("url", url));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not save the file: " + e.getMessage()));
        }
    }
}