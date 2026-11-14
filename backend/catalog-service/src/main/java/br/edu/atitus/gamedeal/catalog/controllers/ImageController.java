package br.edu.atitus.gamedeal.catalog.controllers;

import br.edu.atitus.gamedeal.catalog.dtos.ImageUploadResponse;
import br.edu.atitus.gamedeal.catalog.services.ImageStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

@RestController
public class ImageController {

    private final ImageStorageService storage;

    public ImageController(ImageStorageService storage) {
        this.storage = storage;
    }

    /** Upload de foto do anúncio (multipart, campo "file"). Rota protegida. */
    @PostMapping(value = "/ws/listings/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponse> upload(@RequestHeader("X-User-Id") Long userId,
                                                      @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ImageUploadResponse(storage.store(file)));
    }

    /** Download público da foto. */
    @GetMapping("/images/{name}")
    public ResponseEntity<Resource> download(@PathVariable String name) {
        Resource resource = storage.load(name);
        MediaType type = MediaTypeFactory.getMediaType(resource).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok()
                .contentType(type)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(7)))
                .body(resource);
    }
}
