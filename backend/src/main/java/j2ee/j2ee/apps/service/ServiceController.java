package j2ee.j2ee.apps.service;

import java.util.HashMap;
import java.util.Optional;
import java.util.List;

import j2ee.j2ee.apps.product.ProductEntity;
import j2ee.j2ee.apps.service.ServiceEntity;
import j2ee.j2ee.apps.user.UserEntity;
import j2ee.j2ee.apps.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import j2ee.j2ee.apps.user.UserEntity;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ServiceService serviceSerivce;

    @GetMapping("/ListServices")
    public ResponseEntity<List<ServiceEntity>> getAllByLoggedInUser(Authentication authentication) {
        try {
            // Lấy thông tin username từ Authentication
            String username = authentication.getPrincipal().toString();
            System.out.println("Logged-in username: " + username);

            // Tìm UserEntity dựa trên email (username)
            Optional<UserEntity> userOptional = userRepository.findByEmail(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).build();
            }

            // Lấy userId từ UserEntity
            UserEntity loggedInUser = userOptional.get();
            System.out.println("Logged-in user ID: " + loggedInUser.getId());
            Long userId = loggedInUser.getId();

            // Lấy danh sách service dựa trên userId
            var serviceList = this.serviceSerivce.getAllServicesByUserId(userId);
            if (serviceList.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(serviceList);
        } catch (Exception e) {
            System.err.println("Internal Server Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }

    }

    @PostMapping
    public ResponseEntity<ServiceEntity> createService(@RequestBody ServiceEntity serviceEntity) {
        try {
            ServiceEntity createdService = serviceSerivce.createService(serviceEntity);
            return ResponseEntity.ok(createdService);
        } catch (Exception e) {
            System.err.println("Error creating service: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{serviceId}")
    public ResponseEntity<ServiceEntity> updateService(
            @PathVariable Long serviceId,
            @RequestBody ServiceEntity serviceEntity) {
        try {
            ServiceEntity updatedService = serviceSerivce.updateService(serviceId, serviceEntity);
            if (updatedService == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedService);
        } catch (Exception e) {
            System.err.println("Error updating service: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{service_id}")
    public ResponseEntity<Void> deleteService(@PathVariable(value = "service_id") long serviceId) {
        try {
            Optional<ServiceEntity> existingProduct = serviceSerivce.getById(serviceId);
            if (existingProduct.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            serviceSerivce.deleteService(serviceId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting product: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteMultipleProducts(@RequestBody List<Long> serviceIds) {
        try {
            serviceSerivce.deleteMultipleServices(serviceIds);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting multiple products: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{storeId}")
    public ResponseEntity<Object> getByStoreId(
            @PathVariable int storeId,
            @RequestParam("page") int page,
            @RequestParam("size") int size) {
        try {
            Page<ServiceEntity> PageService = serviceSerivce.getByStoreId(storeId, page, size);
            if (PageService.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            HashMap<String, Object> response = new HashMap<>();
            response.put("services", PageService.getContent());
            response.put("totalPages", PageService.getTotalPages());
            response.put("totalElements", PageService.getTotalElements());
            response.put("currentPage", PageService.getNumber());

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            System.err.println("Internal Server Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

}
