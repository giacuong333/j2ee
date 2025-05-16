import apiInstance from "../../Config/api";

const baseURL = process.env.REACT_APP_API;

class StoreService {
  // Lấy tất cả store
  async getAllStores() {
    try {
      return await apiInstance.get(`${baseURL}/stores`);
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách store: ${error.message}`);
    }
  }

  // Lấy store theo ID
  async getStoreById(storeId) {
    try {
      return await apiInstance.get(`${baseURL}/stores/${storeId}`);
    } catch (error) {
      throw new Error(`Lỗi khi lấy store ID ${storeId}: ${error.message}`);
    }
  }

  // Lấy ảnh của store theo ID
  async getStoreImage(storeId) {
    try {
      return await apiInstance.get(`${baseURL}/stores/${storeId}/image`, {
        responseType: 'blob', 
      });
    } catch (error) {
      throw new Error(`Lỗi khi lấy ảnh store ID ${storeId}: ${error.message}`);
    }
  }

  // Tạo store mới
  async createStore(storeData, imageFile) {
    try {
    const formData = new FormData();
    formData.append("imageFile", imageFile);
    formData.append(
      "storeDTO",
      new Blob([JSON.stringify(storeData)], { type: "application/json" })
    );
  
 

      return await apiInstance.post(`${baseURL}/stores`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw new Error(`Lỗi khi tạo store: ${error.message}`);
    }
  }

  // Cập nhật store
  async updateStore(storeId, storeData, imageFile) {
    try {
      const formData = new FormData();
        formData.append(
      "storeDTO",
      new Blob([JSON.stringify(storeData)], { type: "application/json" })
    );
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }
      console.log(imageFile)

      return await apiInstance.put(`${baseURL}/stores/${storeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật store ID ${storeId}: ${error.message}`);
    }
  }

  // Xóa một store
  async deleteStore(storeId) {
    try {
      return await apiInstance.delete(`${baseURL}/stores/${storeId}`);
    } catch (error) {
      throw new Error(`Lỗi khi xóa store ID ${storeId}: ${error.message}`);
    }
  }

  // Xóa nhiều store
  async deleteMultipleStores(storeIds) {
    try {
      return await apiInstance.delete(`${baseURL}/stores/delete-multiple`, {
        data: storeIds,
      });
    } catch (error) {
      throw new Error(`Lỗi khi xóa nhiều store: ${error.message}`);
    }
  }

  // Import stores
  async importStores(stores) {
    try {
      return await apiInstance.post(`${baseURL}/stores/import`, stores);
    } catch (error) {
      throw new Error(`Lỗi khi import stores: ${error.message}`);
    }
  }
}

export default new StoreService();