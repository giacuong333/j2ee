package j2ee.j2ee.apps.store;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

import java.util.List;

public interface StoreRepository extends JpaRepository<StoreEntity, Long> {
    StoreEntity findById(long id);
    @Query("SELECT s FROM stores s WHERE s.owner.id = :userId")
    Optional<StoreEntity> findStoreByUserId(@Param("userId") Long userId);
    void deleteAllByIdIn(List<Long> ids);
}
