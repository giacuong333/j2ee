package j2ee.j2ee.apps.service;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import j2ee.j2ee.apps.product.ProductEntity;

import java.util.List;
@Service
public class ServiceService {
    @Autowired
    private ServiceRepository serviceRepository;

    public Page<ServiceEntity> getByStoreId(int storeId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name"));
        return serviceRepository.findAllByStoreId(storeId, pageable);
    }

    public List<ServiceEntity> getAllServicesByUserId(long userId) {
        return serviceRepository.findAllByOwnerId(userId);
    }

    public ServiceEntity createService(ServiceEntity serviceEntity) {
        return serviceRepository.save(serviceEntity);
    }

        public ServiceEntity updateService(Long serviceId, ServiceEntity serviceEntity) {
        Optional<ServiceEntity> existingService = serviceRepository.findById(serviceId);
        if (existingService.isPresent()) {
            ServiceEntity serviceToUpdate = existingService.get();
            serviceToUpdate.setName(serviceEntity.getName());
            serviceToUpdate.setDescription(serviceEntity.getDescription());
            serviceToUpdate.setPrice(serviceEntity.getPrice());
            serviceToUpdate.setDuration(serviceEntity.getDuration());
            serviceToUpdate.setStatus(serviceEntity.getStatus());
            serviceToUpdate.setCategory_of_service(serviceEntity.getCategory_of_service());
            return serviceRepository.save(serviceToUpdate);
        }
        return null;
    }

    public Optional<ServiceEntity> getById(long id) {
        return this.serviceRepository.findById(id);
    }

    public void deleteService(long serviceId) {
        serviceRepository.deleteById(serviceId);
    }

    public void deleteMultipleServices(List<Long> serviceIds) {
        serviceRepository.deleteAllById(serviceIds);
    }
}
