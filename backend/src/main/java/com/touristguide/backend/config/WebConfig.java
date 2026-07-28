package com.touristguide.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Makes the "uploads" folder (where UploadController saves partner images)
 * accessible over HTTP at http://localhost:8080/uploads/<filename>.
 *
 * Without this, the files would be saved to disk correctly but the browser
 * would get a 404 trying to actually display them.
 *
 * Uses an absolute path (resolved the same way as UploadController.UPLOAD_DIR)
 * so the folder being served is guaranteed to be the exact same folder the
 * files are actually written to, regardless of the app's working directory.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadsPath = Paths.get(System.getProperty("user.dir"), "uploads")
                .toAbsolutePath()
                .normalize()
                .toString();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsPath + "/");
    }
}