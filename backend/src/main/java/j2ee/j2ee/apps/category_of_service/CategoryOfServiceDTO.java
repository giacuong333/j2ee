package j2ee.j2ee.apps.category_of_service;

import jakarta.persistence.Lob;
import lombok.Data;

@Data
public class CategoryOfServiceDTO {
    private Integer id;
    private String name;
    private String imageName;
    private String imageType;
    @Lob
    private byte[] image;

    private String status;
}
