package j2ee.j2ee.apps.service;

import j2ee.j2ee.apps.category_of_service.CategoryOfServiceEntity;
import j2ee.j2ee.apps.store.StoreEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity(name = "services")
@Data
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    private String description;

    private Double price;

    private Integer duration;

    private String status;

    @ManyToOne
    @JoinColumn(name = "store_id", referencedColumnName = "id")
    private StoreEntity store;

    @ManyToOne
    @JoinColumn(name = "category_of_service_id", referencedColumnName = "id")
    private CategoryOfServiceEntity category_of_service;

    
}
