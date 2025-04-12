package j2ee.j2ee.apps.store;

import j2ee.j2ee.apps.user.UserDTO;
import j2ee.j2ee.apps.user.UserEntity;
import j2ee.j2ee.apps.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    private final DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public Optional<List<StoreEntity>> getAll() {
        List<StoreEntity> storeList = this.storeRepository.findAll();
        return Optional.ofNullable((storeList));
    }

    public Optional<StoreEntity> getById(long id) {
        return this.storeRepository.findById(id);
    }

    private StoreDTO toDTO(StoreEntity entity) {
        StoreDTO dto = StoreDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .address(entity.getAddress())
                .phone(entity.getPhone())
                .image(entity.getImage())
                .createdAt(formatDateTime(entity.getCreated_at()))
                .updatedAt(formatDateTime(entity.getUpdated_at()))
                .openTime(formatTime(entity.getOpen_time()))
                .closeTime(formatTime(entity.getClose_time()))
                .status(entity.getStatus())
                .build();

        if (entity.getOwner() != null) {
            UserDTO ownerDTO = new UserDTO();
            ownerDTO.setId(entity.getOwner().getId());
            ownerDTO.setName(entity.getOwner().getName());
            dto.setOwnerId(ownerDTO);
        }

        return dto;
    }

    private StoreEntity toEntity(StoreDTO dto) {
        StoreEntity entity = new StoreEntity();

        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setAddress(dto.getAddress());
        entity.setPhone(dto.getPhone());
        entity.setImage(dto.getImage());
        entity.setCreated_at(parseDateTime(dto.getCreatedAt(), LocalDateTime.now()));
        entity.setUpdated_at(parseDateTime(dto.getUpdatedAt(), LocalDateTime.now()));
        entity.setOpen_time(parseTime(dto.getOpenTime()));
        entity.setClose_time(parseTime(dto.getCloseTime()));
        entity.setStatus(dto.getStatus());


        if (dto.getOwnerId() != null) {
            Long ownerId = dto.getOwnerId().getId();
            if (ownerId != null) {
                UserEntity owner = userRepository.findById(ownerId)
                        .orElseThrow(() -> new RuntimeException(
                                "Không tìm thấy user với ID: " + ownerId));
                entity.setOwner(owner);
            }
        }

        return entity;
    }

    private String formatDateTime(LocalDateTime dt) {
        return dt != null ? dt.format(dateTimeFormatter) : null;
    }

    private String formatTime(LocalTime time) {
        return time != null ? time.toString() : null;
    }

    private LocalDateTime parseDateTime(String dateTimeStr, LocalDateTime defaultValue) {
        try {
            return dateTimeStr != null ? LocalDateTime.parse(dateTimeStr, dateTimeFormatter)
                    : defaultValue;
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private LocalTime parseTime(String timeStr) {
        try {
            return timeStr != null ? LocalTime.parse(timeStr) : null;
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional
    public StoreDTO createStore(StoreDTO storeDTO) {
        StoreEntity entity = toEntity(storeDTO);
        entity.setCreated_at(LocalDateTime.now());
        entity.setUpdated_at(LocalDateTime.now());
        StoreEntity saved = storeRepository.save(entity);
        return toDTO(saved);
    }

    public List<StoreDTO> getAllStores() {
        return storeRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public StoreDTO getStoreById(Long id) {
        return storeRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy store với ID: " + id));
    }

    @Transactional
    public StoreDTO updateStore(Long id, StoreDTO storeDTO) {
        StoreEntity entity = storeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy store với ID: " + id));

        entity.setName(storeDTO.getName());
        entity.setDescription(storeDTO.getDescription());
        entity.setAddress(storeDTO.getAddress());
        entity.setPhone(storeDTO.getPhone());
        entity.setImage(storeDTO.getImage());
        entity.setOpen_time(parseTime(storeDTO.getOpenTime()));
        entity.setClose_time(parseTime(storeDTO.getCloseTime()));
        entity.setStatus(storeDTO.getStatus());

        if (storeDTO.getOwnerId() != null) {
            UserEntity owner = userRepository.findById(storeDTO.getOwnerId().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy user với ID: " + storeDTO.getOwnerId().getId()));
            entity.setOwner(owner);
        }

        entity.setUpdated_at(LocalDateTime.now());
        StoreEntity updated = storeRepository.save(entity);
        return toDTO(updated);
    }

    @Transactional
    public void deleteStore(Long id) {
        if (!storeRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy store với ID: " + id);
        }
        storeRepository.deleteById(id);
    }

    @Transactional
    public void deleteMultipleStores(List<Long> ids) {
        storeRepository.deleteAllByIdIn(ids);
    }
}
