import React, { useState, useEffect, use } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import StoreService from "../../../Services/store";
import { showToast } from "../../../Components/Toast/index.jsx";
import { FaRegEdit } from "react-icons/fa";


const Loading = React.lazy(() => import("../../../Components/Loading/index.jsx"));
const Form = React.lazy(() => import("./Form/index.jsx"));
const StoreOwner = () => {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editStore, setEditStore] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await StoreService.getStoreBylogin();
        const storeArray = [response.data];
        setStoreData(storeArray);
      } catch (error) {
        showToast("Lỗi khi tải danh sách", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
   
  });

  const handleEdit = (store) => {
    setEditStore(store);
		setShowForm(true);
  };

  const handleRowsSelected = ({ selectedRow }) => {
		setSelectedRow(selectedRow);
	};

  const handleRowClicked = (row) => {
    setSelectedRow(row);
};
  const handleFormSubmit = async (newStoreData) => {
      try {
        if (editStore) {
          const response = await StoreService.updateStore(editStore.id, newStoreData);
          setStoreData(
            storeData.map((store) =>
              store.id === editStore.id ? response.data : store
            )
          );
          showToast("Cập nhật thành công", "success");
          console.log("Cập nhật thành công:", response.data);
          console.log("Dữ liệu sau khi cập nhật:", storeData);
        } 
      } catch (error) {
        console.error("Lỗi khi lưu:", error);
        const errorMessage =
          typeof error === "string"
            ? error
            : error.message || "Lỗi không xác định";
        showToast(`Lỗi khi lưu: ${errorMessage}`, "error");
      }
    };

  const columns = [
    {
      name: "Tên cửa hàng",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Địa chỉ",
      selector: (row) => row.address,
      sortable: true,
    },
    {
      name: "Số điện thoại",
      selector: (row) => row.phone,
      sortable: true,
    },
    {
      name: "Open Time",
      selector: (row) => row.open_time,
      sortable: true,
    },
    {
      name: "Close Time",
      selector: (row) => row.close_time,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
    },
    
    {
      name: "Actions",
      center: true,
      cell: (row) => (
        <div className="flex gap-2">
          <FaRegEdit
            className="cursor-pointer"
            size={18}
            onClick={() => handleEdit(row)}
          />
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <>
     <div>
      <DataTable
        columns={columns}
        data={storeData}
        pagination
        onRowClicked={handleRowClicked}
        highlightOnHover
        striped
      />
    </div>
    
    <Form
				toggle={showForm}
				setToggle={() => {
					setShowForm(false);
					setEditStore(null);
				}}
				initialData={editStore}
				onSubmit={handleFormSubmit}
				isDisabled={false}
			/>

			<Form
				toggle={!!selectedRow}
				setToggle={() => setSelectedRow(null)}
				initialData={selectedRow}
				onSubmit={() => {}}
				isDisabled={true}
			/>
    </>
  );
};

export default StoreOwner;
