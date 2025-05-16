import apiInstance from "../../Config/api";

const baseURL = process.env.REACT_APP_API;

class CategoryOfServiceService {
  // Lấy tất cả Category Of Service
   getAllCategoryOfServices = async ()=> {
    try {
      return await apiInstance.get(`${baseURL}/categoryOfServices`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách category: ${error.response?.data?.message || error.message}`);
    }
  }


  // Lấy Category Of Service theo ID
   getCategoryOfServicesById =  async (categoryOfServiceId) =>{
    try {
      return await apiInstance.get(`${baseURL}/categoryOfServices/${categoryOfServiceId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      throw new Error(`Lỗi khi lấy category ID ${categoryOfServiceId}: ${error.response?.data?.message || error.message}`);
    }
  }

  // Lấy image của Category Of Service theo ID
   getCategoryOSImage= async (categoryOfServiceId) => {
    try {
      return await apiInstance.get(`${baseURL}/categoryOfServices/${categoryOfServiceId}/image`, {
        responseType: "blob",
      });
    } catch (error) {
      throw new Error(`Lỗi khi lấy ảnh category ID ${categoryOfServiceId}: ${error.response?.data?.message || error.message}`);
    }
  }

  // Tạo Category Of Service
   createCategoryOfServices = async (categoryOfServiceDTO, imageFile)=> {
    try {
      const formData = new FormData();

      formData.append(
        "categoryDTO",
        new Blob([JSON.stringify(categoryOfServiceDTO)], { type: "application/json" })
      );
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      

      return await apiInstance.post(`${baseURL}/categoryOfServices`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          
        },
      });
    } catch (error) {
      console.error("Lỗi chi tiết:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw new Error(`Lỗi khi tạo category: ${error.response?.data?.message || error.message}`);
    }
  }

  // Cập nhật Category Of Service
   updateCategoryOfServices= async (id, categoryOfServiceDTO, imageFile)=>  {
    try {
      const formData = new FormData();
      formData.append(
        "categoryDTO",
        new Blob([JSON.stringify(categoryOfServiceDTO)], { type: "application/json" })
      );
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }


      return await apiInstance.put(`${baseURL}/categoryOfServices/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Lỗi chi tiết:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw new Error(`Lỗi khi cập nhật category ID ${id}: ${error.response?.data?.message || error.message}`);
    }
  }

  // Xóa một Category Of Service
   deleteCategoryOfService  = async (categoryOfServiceId) => {
    try {
      return await apiInstance.delete(`${baseURL}/categoryOfServices/${categoryOfServiceId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      throw new Error(`Lỗi khi xóa category ID ${categoryOfServiceId}: ${error.response?.data?.message || error.message}`);
    }
  }

  // Xóa nhiều Category Of Service
   deleteMultipleCategoryOfServices = async (categoryOfServiceIds) => {
    try {
      return await apiInstance.delete(`${baseURL}/categoryOfServices/delete-multiple`, {
        data: categoryOfServiceIds,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      throw new Error(`Lỗi khi xóa nhiều category: ${error.response?.data?.message || error.message}`);
    }
  }
}

export default new CategoryOfServiceService();