package br.edu.atitus.gamedeal.catalog.services;

import br.edu.atitus.gamedeal.catalog.exceptions.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/** Guarda as fotos dos anúncios em disco (volume Docker) e as serve por /images/{arquivo}. */
@Service
public class ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);
    private static final Map<String, String> ALLOWED = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp");
    private static final Pattern SAFE_NAME = Pattern.compile("^[a-f0-9\\-]{36}\\.(jpg|png|webp)$");

    private final Path directory;

    public ImageStorageService(@Value("${app.images.dir:/data/images}") String directory) throws IOException {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
        Files.createDirectories(this.directory);
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nenhuma imagem enviada");
        String extension = ALLOWED.get(file.getContentType());
        if (extension == null)
            throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Formato não suportado. Use JPG, PNG ou WEBP");

        String name = UUID.randomUUID() + "." + extension;
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, directory.resolve(name), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            log.error("Falha ao salvar imagem", ex);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível salvar a imagem");
        }
        log.info("Imagem salva {} ({} bytes)", name, file.getSize());
        return "/images/" + name;
    }

    public Resource load(String name) {
        // Nome validado por regex: impede acesso a outros arquivos (path traversal).
        if (!SAFE_NAME.matcher(name).matches())
            throw new ApiException(HttpStatus.NOT_FOUND, "Imagem não encontrada");
        var resource = new FileSystemResource(directory.resolve(name));
        if (!resource.exists())
            throw new ApiException(HttpStatus.NOT_FOUND, "Imagem não encontrada");
        return resource;
    }
}
