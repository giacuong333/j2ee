package j2ee.j2ee.apps.store;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/stores")
    public class StoreController {

        @Autowired
        private StoreService storeService;

        // Create
        @PostMapping
        public ResponseEntity<StoreDTO> createStore(
                @RequestPart StoreDTO storeDTO,
                @RequestPart(required = false) MultipartFile imageFile
        ) {
            try {
                StoreDTO createdStore = storeService.createStore(storeDTO, imageFile);
                return ResponseEntity.ok(createdStore);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.badRequest().body(null);
            }
        }



    @GetMapping("{storeId}/image")
    public ResponseEntity<byte[]> getImageByStoreId(@PathVariable long storeId) {
        StoreEntity store = storeService.getStore(storeId);
        byte[] imageFile = store.getImage();
        return ResponseEntity.ok().contentType(MediaType.valueOf(store.getImageType())).body(imageFile);

    }

    // Lấy tất cả stores
    @GetMapping
    public ResponseEntity<List<StoreDTO>> getAllStores() {
        try {
            List<StoreDTO> stores = storeService.getAllStores();
            return ResponseEntity.ok(stores);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Lấy store theo ID
    @GetMapping("/{id}")
    public ResponseEntity<StoreDTO> getStoreById(@PathVariable Long id) {
        try {
            StoreDTO store = storeService.getStoreById(id);
            return ResponseEntity.ok(store);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Update
    @PutMapping("/{storeId}")
    public ResponseEntity<StoreDTO> updateStore(@PathVariable Long storeId, @RequestPart StoreDTO storeDTO,@RequestPart(required = false) MultipartFile imageFile) {
        try {
            StoreDTO updatedStore = storeService.updateStore(storeId, storeDTO,imageFile);
            return ResponseEntity.ok(updatedStore);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStore(@PathVariable Long id) {
        try {
            storeService.deleteStore(id);
            return ResponseEntity.ok("Xóa store thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
        }
    }

    // Deletes
    @DeleteMapping("/delete-multiple")
    @Transactional
    public ResponseEntity<String> deleteMultipleStores(@RequestBody List<Long> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest().body("Danh sách ID không được rỗng");
            }
            storeService.deleteMultipleStores(ids);
            return ResponseEntity.ok("Xóa nhiều store thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
        }
    }
    //import
    @PostMapping("/import")
    public ResponseEntity<String> importStores(@RequestBody List<StoreEntity> stores) {
        storeService.importStores(stores);
        return ResponseEntity.ok("Import successful");
    }
}