package j2ee.j2ee.apps.store;

import org.springframework.web.bind.annotation.*;

import j2ee.j2ee.apps.user.UserEntity;

import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import j2ee.j2ee.apps.user.UserRepository;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreService storeService;

    @GetMapping
    public ResponseEntity<List<StoreEntity>> getAll() {
        try {
            var storeList = storeService.getAll();
            if (!storeList.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok().body(storeList.get());
        } catch (Exception e) {
            System.err.println("Internal Server Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/mystore")
    public ResponseEntity<StoreEntity> getStoreByLoggedInUser(Authentication authentication) {
        try {

            String username = authentication.getPrincipal().toString();
            System.out.println("Logged-in username: " + username);

            Optional<UserEntity> userOptional = userRepository.findByEmail(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).build();
            }

            UserEntity loggedInUser = userOptional.get();
            System.out.println("Logged-in user ID: " + loggedInUser.getId());

            Long userId = loggedInUser.getId();
            Optional<StoreEntity> store = storeService.getStoreByUserId(userId);

            if (store.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(store.get());
        } catch (Exception e) {
            System.err.println("Error fetching store for logged-in user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<StoreEntity> updateStoreOwner(@PathVariable Long id, @RequestBody StoreEntity updatedStore) {
        try {
            // Gọi service để xử lý logic cập nhật
            StoreEntity savedStore = storeService.updateStore(id, updatedStore);
            return ResponseEntity.ok(savedStore);
        } catch (RuntimeException e) {
            System.err.println("Error updating store: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Internal server error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // // Create
    // @PostMapping
    // public ResponseEntity<StoreDTO> createStore(@RequestBody StoreDTO storeDTO) {
    // try {
    // StoreDTO createdStore = storeService.createStore(storeDTO);
    // return ResponseEntity.ok(createdStore);
    // } catch (Exception e) {
    // e.printStackTrace();
    // return ResponseEntity.badRequest().body(null);
    // }
    // }

    // // Lấy tất cả stores
    // @GetMapping
    // public ResponseEntity<List<StoreDTO>> getAllStores() {
    // try {
    // List<StoreDTO> stores = storeService.getAllStores();
    // return ResponseEntity.ok(stores);
    // } catch (Exception e) {
    // return ResponseEntity.badRequest().body(null);
    // }
    // }

    // // Update
    // @PutMapping("/{id}")
    // public ResponseEntity<StoreDTO> updateStore(@PathVariable Long id,
    //         @RequestBody StoreDTO storeDTO) {
    //     try {
    //         StoreDTO updatedStore = storeService.updateStore(id, storeDTO);
    //         return ResponseEntity.ok(updatedStore);
    //     } catch (RuntimeException e) {
    //         return ResponseEntity.badRequest().body(null);
    //     }
    // }

    // // Delete
    // @DeleteMapping("/{id}")
    // public ResponseEntity<String> deleteStore(@PathVariable Long id) {
    // try {
    // storeService.deleteStore(id);
    // return ResponseEntity.ok("Xóa store thành công");
    // } catch (RuntimeException e) {
    // return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
    // }
    // }

    // // Deletes
    // @DeleteMapping("/delete-multiple")
    // @Transactional
    // public ResponseEntity<String> deleteMultipleStores(@RequestBody List<Long>
    // ids) {
    // try {
    // if (ids == null || ids.isEmpty()) {
    // return ResponseEntity.badRequest().body("Danh sách ID không được rỗng");
    // }
    // storeService.deleteMultipleStores(ids);
    // return ResponseEntity.ok("Xóa nhiều store thành công");
    // } catch (RuntimeException e) {
    // return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
    // }
    // }
}
