package j2ee.j2ee.apps.category_of_service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import j2ee.j2ee.apps.store.StoreEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CategoryOfServiceService {

    @Autowired
    private CategoryOfServiceRepository categoryRepository;

    public CategoryOfServiceEntity getCOS(int id) {
        return categoryRepository.findById(id).orElse(null);
    }

    private CategoryOfServiceDTO toDTO(CategoryOfServiceEntity entity) {
        CategoryOfServiceDTO dto = new CategoryOfServiceDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());

        dto.setStatus(entity.getStatus());
        return dto;
    }


    private CategoryOfServiceEntity toEntity(CategoryOfServiceDTO dto) {
        CategoryOfServiceEntity entity = new CategoryOfServiceEntity();
        entity.setId(dto.getId());
        entity.setName(dto.getName());

        entity.setStatus(dto.getStatus());
        return entity;
    }

    // Create
    @Transactional
    public CategoryOfServiceDTO createCategory(CategoryOfServiceDTO categoryOSDTO, MultipartFile multipartFile) throws IOException {
        CategoryOfServiceEntity entity = toEntity(categoryOSDTO);
        entity.setImageName(multipartFile.getOriginalFilename());
        entity.setImageType(multipartFile.getContentType());
        entity.setImage(multipartFile.getBytes());
        CategoryOfServiceEntity savedEntity = categoryRepository.save(entity);
        return toDTO(savedEntity);
    }

    //Lấy tất cả categories
    public List<CategoryOfServiceDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Lấy category theo ID
    public CategoryOfServiceDTO getCategoryById(Integer id) {
        return categoryRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy category với ID: " + id));
    }

    // Update
    @Transactional
    public CategoryOfServiceDTO updateCategory(Integer id, CategoryOfServiceDTO categoryDTO,MultipartFile multipartFile) throws RuntimeException, IOException {

        CategoryOfServiceEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy category với ID: " + id));
        entity.setName(categoryDTO.getName());

        entity.setStatus(categoryDTO.getStatus());
        if (multipartFile != null && !multipartFile.isEmpty()) {
            entity.setImageName(multipartFile.getOriginalFilename());
            entity.setImageType(multipartFile.getContentType());
            entity.setImage(multipartFile.getBytes());
        }
        CategoryOfServiceEntity updatedEntity = categoryRepository.save(entity);
        return toDTO(updatedEntity);
    }

    // Delete
    @Transactional
    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy category với ID: " + id);
        }
        categoryRepository.deleteById(id);
    }

    // Deletes
    @Transactional
    public void deleteMultipleCategories(List<Integer> ids) {
        categoryRepository.deleteAllByIdIn(ids);
    }
}