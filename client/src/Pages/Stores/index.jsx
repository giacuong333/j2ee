import React, { useState, useEffect, Suspense } from "react";
import DataTable from "react-data-table-component";
import { isEmpty } from "../../Utils/validation.js";
import { CiSearch } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import ConfirmPopup from "../../Components/ConfirmPopup/index.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../Components/Toast/index.jsx";
import StoreService from "../../Services/store";
import * as XLSX from "xlsx";

const FormControl = React.lazy(() => import("../../Components/FormControl/index.jsx"));
const Loading = React.lazy(() => import("../../Components/Loading/index.jsx"));
const Form = React.lazy(() => import("./Form/index.jsx"));

const SubHeader = ({ selectedRows, handleDeleteMultiple }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (selectedRows.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full p-5 bg-gray-100 flex items-center justify-between">
        <span>{selectedRows.length} mục được chọn</span>
        <button onClick={() => setShowConfirmDelete(true)}>
          <IoTrashOutline
            size={36}
            className="cursor-pointer rounded-full bg-red-100 hover:bg-red-200 text-red-500 p-2"
          />
        </button>
      </div>

      <ConfirmPopup
        toggle={showConfirmDelete}
        setToggle={() => setShowConfirmDelete(false)}
        onOk={handleDeleteMultiple}
        onCancel={() => setShowConfirmDelete(false)}
        title="Are you sure you want to delete these?"
        message="This action cannot be undone"
        okButtonText="OK"
        cancelButtonText="Cancel"
      />
    </>
  );
};

const SelectBox = React.forwardRef(({ ...props }) => {
  return (
    <input
      type="checkbox"
      {...props}
      className="w-4 h-4 text-[#435d63] bg-[#435d63] border-gray-200 rounded focus:ring-[#435d63]"
    />
  );
});

const Stores = () => {
  const columns = [
    {
      name: "Image",
      sortable: true,
      cell: (row) => (
        <img
          src={row.imageUrl || "../../assets/images/store/default.png"}
          alt={row.name || "Store"}
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
          
        />
      ),
    },
    {
      name: "Name",
      sortable: true,
      selector: (row) => row.name || "N/A",
    },
    {
      name: "Description",
      sortable: true,
      selector: (row) => row.description || "N/A",
    },
    {
      name: "Address",
      sortable: true,
      selector: (row) => row.address || "N/A",
    },
    {
      name: "Owner",
      sortable: true,
      selector: (row) => row.ownerId?.name || "N/A",
    },
    {
      name: "Status",
      sortable: true,
      selector: (row) => (row.status === "active" ? "Active" : "Inactive"),
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
          <IoTrashOutline
            className="cursor-pointer"
            size={18}
            onClick={() => handleDeleteSingle(row.id)}
          />
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  const [searchInput, setSearchInput] = useState("");
  const [errors, setErrors] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [storesData, setStoresData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStore, setEditStore] = useState(null);
  const [showConfirmDeleteSingle, setShowConfirmDeleteSingle] = useState(false);
  const [storeIdToDelete, setStoreIdToDelete] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await StoreService.getAllStores();
        const storesWithImages = await Promise.all(
          response.data.map(async (store) => {
            try {
              const imageResponse = await StoreService.getStoreImage(store.id);
              const imageUrl = URL.createObjectURL(imageResponse.data);
              return { ...store, imageUrl };
            } catch (error) {
              console.error(`Lỗi khi tải ảnh cho store ${store.id}:`, error);
              return { ...store, imageUrl: null };
            }
          })
        );
        setStoresData(storesWithImages);
      } catch (error) {
        showToast("Lỗi khi tải danh sách cửa hàng", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const handleFieldsChange = (key, value) => {
    setSearchInput(value);
    setErrors("");
  };

  const handleRowsSelected = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  const handleDeleteMultiple = async () => {
    const ids = selectedRows.map((row) => row.id);
    try {
      await StoreService.deleteMultipleStores(ids);
      setStoresData(storesData.filter((store) => !ids.includes(store.id)));
      setSelectedRows([]);
      showToast("Xóa nhiều thành công", "success");
    } catch (error) {
      console.error("Lỗi khi xóa nhiều:", error);
      showToast("Lỗi khi xóa nhiều", "error");
    }
  };

  const handleDeleteSingle = (storeId) => {
    setStoreIdToDelete(storeId);
    setShowConfirmDeleteSingle(true);
  };

  const confirmDeleteSingle = async () => {
    try {
      await StoreService.deleteStore(storeIdToDelete);
      setStoresData(storesData.filter((store) => store.id !== storeIdToDelete));
      setShowConfirmDeleteSingle(false);
      showToast("Xóa thành công", "success");
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      showToast("Lỗi khi xóa", "error");
    }
  };

  const handleEdit = (store) => {
    setEditStore(store);
    setShowForm(true);
  };

  const handleFormSubmit = async (newStoreData) => {
    try {
      if (editStore) {
        const response = await StoreService.updateStore(
          editStore.id,
          newStoreData.storeData,
          newStoreData.imageFile
        );
        const updatedStore = response.data;
        try {
          const imageResponse = await StoreService.getStoreImage(updatedStore.id);
          updatedStore.imageUrl = URL.createObjectURL(imageResponse.data);
        } catch (error) {
          updatedStore.imageUrl = null;
        }
        setStoresData(
          storesData.map((store) =>
            store.id === editStore.id ? updatedStore : store
          )
        );
      } else {
        const response = await StoreService.createStore(
          newStoreData.storeData,
          newStoreData.imageFile
        );
        const newStore = response.data;
        try {
          const imageResponse = await StoreService.getStoreImage(newStore.id);
          newStore.imageUrl = URL.createObjectURL(imageResponse.data);
        } catch (error) {
          newStore.imageUrl = null;
        }
        setStoresData([...storesData, newStore]);
      }
      setShowForm(false);
      setEditStore(null);
      showToast(editStore ? "Cập nhật thành công" : "Tạo thành công", "success");
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      showToast("Lỗi khi lưu", "error");
    }
  };

  const handleRowClicked = (row) => {
    setSelectedRow(row);
  };

  const handleActionsClicked = () => {
    setShowActions(!showActions);
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx, .xls";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const mappedData = jsonData.map((item) => ({
            name: item.Name || "Unnamed Store",
            description: item.Description || null,
            address: item.Address || null,
            phone: item.Phone || null,
            owner: { id: Number(item.OwnerID) || null },
            status: item.Status === "Active" ? "ACTIVE" : "INACTIVE",
            openTime: item["Open Time"] || null,
            closeTime: item["Close Time"] || null,
          }));

          await StoreService.importStores(mappedData);
          const response = await StoreService.getAllStores();
          const storesWithImages = await Promise.all(
            response.data.map(async (store) => {
              try {
                const imageResponse = await StoreService.getStoreImage(store.id);
                const imageUrl = URL.createObjectURL(imageResponse.data);
                return { ...store, imageUrl };
              } catch (error) {
                return { ...store, imageUrl: null };
              }
            })
          );
          setStoresData(storesWithImages);
          showToast("Import dữ liệu thành công", "success");
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("Lỗi khi import:", error);
        showToast("Lỗi khi import dữ liệu", "error");
      }
    };

    input.click();
  };

  const handleExport = () => {
    const exportData = storesData.map((store) => ({
      ID: store.id,
      Name: store.name,
      Description: store.description || "N/A",
      Address: store.address || "N/A",
      Phone: store.phone || "N/A",
      "Owner Name": store.ownerId?.name || "N/A",
      Status: store.status === "ACTIVE" ? "Active" : "Inactive",
      "Open Time": store.openTime || "N/A",
      "Close Time": store.closeTime || "N/A",
      "Created At": store.createdAt || "N/A",
      "Updated At": store.updatedAt || "N/A",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stores");
    XLSX.writeFile(workbook, "Stores_Export.xlsx");
    showToast("Xuất file Excel thành công", "success");
  };

  const filteredData = storesData.filter((store) =>
    (
      (store.name || "") +
      (store.description || "") +
      (store.address || "") +
      (store.ownerId?.name || "")
    )
      .toLowerCase()
      .includes(searchInput.toLowerCase())
  );

  return (
    <Suspense fallback={<Loading />}>
      <section>
        <div>
          <header className="bg-white rounded-md p-4 flex items-center justify-between shadow-md">
            <div className="min-w-fit max-w-md">
              <FormControl
                type="text"
                placeHolder="Search here..."
                wrapInputStyle="!border-black/10 rounded-md focus-within:!border-[#435d63] transition-all"
                inputStyle="font-serif placeholder:text-lg text-black placeholder:font-serif !p-4 !py-2"
                id="search"
                onChange={(event) =>
                  handleFieldsChange("search", event.target.value)
                }
                hasButton
                Icon={CiSearch}
                iconSize={24}
                iconStyle="transition-all text-[#435d63] hover:text-black mx-4"
                hasError={!!errors.searchInput}
                errorMessage={errors.searchInput}
              />
            </div>

            <div className="relative">
              <button
                type="button"
                className="text-sm rounded-md w-fit transition-all duration-700 hover:bg-black text-white bg-[#435d63] p-2 font-serif font-semibold"
                onClick={handleActionsClicked}
              >
                <p>Action</p>
              </button>
              {showActions && (
                <div className="overflow-hidden absolute z-10 top-full right-0 rounded-md bg-white w-fit shadow-md">
                  <button
                    className="p-2 px-4 hover:bg-black/10 w-full"
                    onClick={() => {
                      setEditStore(null);
                      setShowForm(true);
                    }}
                  >
                    Create
                  </button>
                  <button
                    className="p-2 px-4 hover:bg-black/10 w-full"
                    onClick={handleImport}
                  >
                    Import
                  </button>
                  <button
                    className="p-2 px-4 hover:bg-black/10 w-full"
                    onClick={handleExport}
                  >
                    Export
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="mt-4 rounded-md shadow-md overflow-hidden">
            {loading ? (
              <Loading />
            ) : (
              <DataTable
                customStyles={{
                  subHeader: {
                    style: { padding: "0", margin: "0", minHeight: "0" },
                  },
                }}
                pointerOnHover
                highlightOnHover
                selectableRows
                striped
                pagination
                onSelectedRowsChange={handleRowsSelected}
                subHeader={selectedRows.length > 0}
                subHeaderComponent={
                  <SubHeader
                    selectedRows={selectedRows}
                    handleDeleteMultiple={handleDeleteMultiple}
                  />
                }
                columns={columns}
                data={filteredData}
                selectableRowsComponent={SelectBox}
                selectableRowsComponentProps={{
                  style: {
                    backgroundColor: "white",
                    borderColor: "#435d63",
                    accentColor: "#435d63",
                  },
                }}
                onRowClicked={handleRowClicked}
              />
            )}
          </main>
        </div>
      </section>

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

      <ConfirmPopup
        toggle={showConfirmDeleteSingle}
        setToggle={() => setShowConfirmDeleteSingle(false)}
        onOk={confirmDeleteSingle}
        onCancel={() => setShowConfirmDeleteSingle(false)}
        title="Are you sure you want to delete this?"
        message="This action cannot be undone"
        okButtonText="OK"
        cancelButtonText="Cancel"
      />

      <ToastContainer />
    </Suspense>
  );
};

export default Stores;