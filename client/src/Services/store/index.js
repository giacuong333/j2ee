import apiInstance from "../../Config/api";

const baseURL = process.env.REACT_APP_API;

class StoreService {
  // Lấy tất cả store
   getAllStores = async () => {
    try {
      return await apiInstance.get(`${baseURL}/stores`);
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách store: ${error.message}`);
    }
  }

  // Lấy store theo ID
   getStoreById = async (storeId)=> {
    try {
      return await apiInstance.get(`${baseURL}/stores/${storeId}`);
    } catch (error) {
      throw new Error(`Lỗi khi lấy store ID ${storeId}: ${error.message}`);
    }
  }

  // Lấy ảnh của store theo ID
   getStoreImage = async (storeId) => {
    try {
      return await apiInstance.get(`${baseURL}/stores/${storeId}/image`, {
        responseType: 'blob', 
      });
    } catch (error) {
      throw new Error(`Lỗi khi lấy ảnh store ID ${storeId}: ${error.message}`);
    }
  }

  // Tạo store mới
   createStore = async (storeData, imageFile) => {
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
   updateStore = async (storeId, storeData, imageFile) => {
    try {
      const formData = new FormData();
        formData.append(
      "storeDTO",
      new Blob([JSON.stringify(storeData)], { type: "application/json" })
    );
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }


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
   deleteStore =  async(storeId)  =>{
    try {
      return await apiInstance.delete(`${baseURL}/stores/${storeId}`);
    } catch (error) {
      throw new Error(`Lỗi khi xóa store ID ${storeId}: ${error.message}`);
    }
  }

  // Xóa nhiều store
   deleteMultipleStores = async (storeIds) => {
    try {
      return await apiInstance.delete(`${baseURL}/stores/delete-multiple`, {
        data: storeIds,
      });
    } catch (error) {
      throw new Error(`Lỗi khi xóa nhiều store: ${error.message}`);
    }
  }

  // Import stores
   importStores = async (stores) =>{
    try {
      return await apiInstance.post(`${baseURL}/stores/import`, stores);
    } catch (error) {
      throw new Error(`Lỗi khi import stores: ${error.message}`);
    }
  }
}

export default new StoreService();