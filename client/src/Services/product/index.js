import apiInstance from "../../Config/api";

const baseURL = process.env.REACT_APP_API;

class ProductService {

    
    static getAllbyStoreId = async () => {
        return await apiInstance.get(`${baseURL}/products/ListProducts`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    };

	// Lấy tất cả danh mục sản phẩm
	static getAllCategories = async () => {
		return await apiInstance.get(`${baseURL}/categories`, {
			headers: {
				"Content-Type": "application/json",
			},
		});
	};
    
	 // Tạo sản phẩm
	 static createProduct = async (payload) => {
        try {
            return await apiInstance.post(`${baseURL}/products`, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
        } catch (error) {
            if (error.response?.status === 409) {
                throw new Error(
                    "Sản phẩm đã tồn tại. Vui lòng thử lại."
                );
            }
            throw error.response?.data || error.message;
        }
    };

    // Cập nhật sản phẩm
    static updateProduct = async (productId, payload) => {
        return await apiInstance.put(`${baseURL}/products/${productId}`, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    };

    // Xóa sản phẩm
    static deleteProduct = async (productId) => {
        return await apiInstance.delete(`${baseURL}/products/${productId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    };

    // Xóa nhiều sản phẩm
    static deleteMultipleProducts = async (productIds) => {
        return await apiInstance.delete(`${baseURL}/products`, {
            data: productIds,
            headers: {
                "Content-Type": "application/json",
            },
        });
    };

}
export default ProductService;