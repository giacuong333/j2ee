package j2ee.j2ee.apps.store;

import j2ee.j2ee.apps.user.UserDTO;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StoreDTO {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String phone;

    private String imageName;
    private String imageType;
    @Lob
    private byte[] image;
    private String createdAt;
    private String updatedAt;
    private String openTime;
    private String closeTime;
    private String status;
    private UserDTO ownerId;
}