import apiInstance from "../../Config/api";

const baseURL = process.env.REACT_APP_API;

class StoreService {
	// Lấy tất cả store
	static getAll = async () => {
		return await apiInstance.get(`${baseURL}/stores`);
	};

	// Lấy Store  theo ID
	getStoreById = async (roleId) => {
		return await apiInstance.get(`${baseURL}/stores/${roleId}`, {
			headers: {
				"Content-Type": "application/json",
			},
		});
	};

	static getStoreBylogin = async () => {
		return await apiInstance.get(`${baseURL}/stores/mystore`, {
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	// // Tạo Store  mới
	// createStore = async (payload) => {
	// 	return await apiInstance.post(`${baseURL}/stores`, payload, {
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 	});
	// };

	// Cập nhật Store
	static updateStore = async (storeId, payload) => {
		return await apiInstance.put(`${baseURL}/stores/${storeId}`, payload, {
			headers: {
				"Content-Type": "application/json",
			},
		});
	};

	// // Xóa một Store
	// deleteStore = async (storeId) => {
	// 	return await apiInstance.delete(`${baseURL}/stores/${storeId}`, {
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 	});
	// };

	// // Xóa nhiều Store
	// deleteMultipleStores = async (storeIds) => {
	// 	return await apiInstance.delete(`${baseURL}/stores/delete-multiple`, {
	// 		data: storeIds,
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 	});
	// };
}

export default StoreService;
