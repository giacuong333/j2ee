package j2ee.j2ee.apps.category_of_service;

import jakarta.persistence.*;
import lombok.Data;

@Entity(name = "categories_of_services")
@Data
public class CategoryOfServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    private String imageName;
    private String imageType;
    @Lob
    private byte[] image;


    private String status;
}
