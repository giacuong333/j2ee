import React, { useState, useEffect } from "react";
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
        title="Are you sure you want to delete these stores?"
        message="This action can be undone"
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
  const [searchInput, setSearchInput] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [storesData, setStoresData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStore, setEditStore] = useState(null);
  const [showConfirmDeleteSingle, setShowConfirmDeleteSingle] = useState(false);
  const [storeIdToDelete, setStoreIdToDelete] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [imageCache, setImageCache] = useState({});

  const columns = [
    {
      name: "Image",
      sortable: true,
      cell: (row) => (
        <img
          src={imageCache[row.id] || "/assets/images/store/default.jpg"}
          alt={row.name || "Store"}
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />
      ),
    },
    {
      name: "Name",
      sortable: true,
      selector: (row) => row.name,
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
      selector: (row) => (row.status === "1" ? "Active" : "Inactive"),
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

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await StoreService.getAllStores();
        const stores = Array.isArray(response.data) ? response.data : [];
        setStoresData(stores);
        setFilteredData(stores);

      
        const imagePromises = stores.map(async (store) => {
          try {
            const imageResponse = await StoreService.getStoreImage(store.id);
            const imageUrl = URL.createObjectURL(imageResponse.data);
            return { id: store.id, url: imageUrl };
          } catch (error) {
            if (error.response?.status === 401) {
              console.warn(`Unauthorized access to image for store ${store.id}`);
              return { id: store.id, url: "/assets/images/store/default.jpg" };
            }
            console.error(`Failed to load image for store ${store.id}:`, error.response?.data || error.message);
            return { id: store.id, url: "/assets/images/store/default.jpg" };
          }
        });

        const imageResults = await Promise.all(imagePromises);
        const newImageCache = imageResults.reduce((acc, { id, url }) => {
          acc[id] = url;
          return acc;
        }, {});
        setImageCache(newImageCache);
      } catch (error) {
        console.error("Error fetching stores:", error.response?.data || error.message);
        showToast("Failed to load stores", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStores();

    return () => {
     
      Object.values(imageCache).forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);

  useEffect(() => {
    const filtered = storesData.filter((store) =>
      [
        store.name || "",
        store.address || "",
        store.ownerId?.name || "",
      ].some((field) => field.toLowerCase().includes(searchInput.toLowerCase()))
    );
    setFilteredData(filtered);
  }, [searchInput, storesData]);

  const handleFieldsChange = (key, value) => {
    setSearchInput(value);
  };

  const handleRowsSelected = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  const handleDeleteMultiple = async () => {
    const ids = selectedRows.map((row) => row.id);
    try {
      setLoading(true);
      await StoreService.deleteMultipleStores(ids);
      setStoresData(storesData.filter((store) => !ids.includes(store.id)));
      setFilteredData(filteredData.filter((store) => !ids.includes(store.id)));
      setSelectedRows([]);
      showToast("Deleted multiple stores successfully", "success");
    } catch (error) {
      console.error("Error deleting multiple stores:", error.response?.data || error.message);
      showToast("Failed to delete multiple stores", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingle = (storeId) => {
    setStoreIdToDelete(storeId);
    setShowConfirmDeleteSingle(true);
  };

  const confirmDeleteSingle = async () => {
    try {
      setLoading(true);
      await StoreService.deleteStore(storeIdToDelete);
      setStoresData(storesData.filter((store) => store.id !== storeIdToDelete));
      setFilteredData(filteredData.filter((store) => store.id !== storeIdToDelete));
      setShowConfirmDeleteSingle(false);
      setImageCache((prev) => {
        const newCache = { ...prev };
        delete newCache[storeIdToDelete];
        return newCache;
      });
      showToast("Deleted store successfully", "success");
    } catch (error) {
      console.error("Error deleting store:", error.response?.data || error.message);
      showToast("Failed to delete store", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store) => {
    setEditStore(store);
    setShowForm(true);
  };

  const handleFormSubmit = async (newStoreData) => {
    try {
      setLoading(true);
      if (!newStoreData || !newStoreData.id) {
        throw new Error("Invalid store data received");
      }

      let imageUrl = imageCache[newStoreData.id] || "/assets/images/store/default.jpg";

    
      try {
        const imageResponse = await StoreService.getStoreImage(newStoreData.id);
        imageUrl = URL.createObjectURL(imageResponse.data);
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn(`Unauthorized access to image for store ${newStoreData.id}`);
        } else {
          console.error(`Failed to load image for store ${newStoreData.id}:`, error.response?.data || error.message);
        }
      }

      setStoresData((prev) => {
        if (editStore) {
          return prev.map((store) =>
            store.id === editStore.id ? newStoreData : store
          );
        }
        return [...prev, newStoreData];
      });

      setFilteredData((prev) => {
        if (editStore) {
          return prev.map((store) =>
            store.id === editStore.id ? newStoreData : store
          );
        }
        return [...prev, newStoreData];
      });

      setImageCache((prev) => ({
        ...prev,
        [newStoreData.id]: imageUrl,
      }));

      showToast(editStore ? "Updated store successfully" : "Created store successfully", "success");
    } catch (error) {
      console.error("Error saving store:", error.message);
      showToast("Failed to save store: " + error.message, "error");
    } finally {
      setShowForm(false);
      setEditStore(null);
      setLoading(false);
    }
  };

  const handleRowClicked = (row) => {
    setSelectedRow(row);
  };

  const handleActionsClicked = () => {
    setShowActions(!showActions);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
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
            ownerId: { id: Number(item.ownerId) || null },
            status: item.Status === "Active" ? "1" : "2",
            openTime: item["Open Time"] || null,
            closeTime: item["Close Time"] || null,
          }));

          await StoreService.importStores(mappedData);
          const response = await StoreService.getAllStores();
          const stores = Array.isArray(response.data) ? response.data : [];
          setStoresData(stores);
          setFilteredData(stores);

      
          const imagePromises = stores.map(async (store) => {
            try {
              const imageResponse = await StoreService.getStoreImage(store.id);
              const imageUrl = URL.createObjectURL(imageResponse.data);
              return { id: store.id, url: imageUrl };
            } catch (error) {
              if (error.response?.status === 401) {
                console.warn(`Unauthorized access to image for store ${store.id}`);
                return { id: store.id, url: "/assets/images/store/default.jpg" };
              }
              console.error(`Failed to load image for store ${store.id}:`, error.response?.data || error.message);
              return { id: store.id, url: "/assets/images/store/default.jpg" };
            }
          });

          const imageResults = await Promise.all(imagePromises);
          setImageCache((prev) => ({
            ...prev,
            ...imageResults.reduce((acc, { id, url }) => {
              acc[id] = url;
              return acc;
            }, {}),
          }));

          showToast("Imported stores successfully", "success");
        } catch (error) {
          console.error("Error importing stores:", error.response?.data || error.message);
          showToast("Failed to import stores", "error");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error.message);
      showToast("Failed to read import file", "error");
    }
  };

  const handleExport = () => {
    const exportData = storesData.map((store) => ({
      ID: store.id,
      Name: store.name,
      Description: store.description || "N/A",
      Address: store.address || "N/A",
      Phone: store.phone || "N/A",
      "Owner Name": store.ownerId?.name || "N/A",
      Status: store.status === "1" ? "Active" : "Inactive",
      "Open Time": store.openTime || "N/A",
      "Close Time": store.closeTime || "N/A",
      "Created At": store.createdAt || "N/A",
      "Updated At": store.updatedAt || "N/A",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stores");
    XLSX.writeFile(workbook, "Stores_Export.xlsx");
    showToast("Exported to Excel successfully", "success");
  };

  return (
    <>
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
                value={searchInput}
                onChange={(event) => handleFieldsChange("search", event.target.value)}
                hasButton
                Icon={CiSearch}
                iconSize={24}
                iconStyle="transition-all text-[#435d63] hover:text-black mx-4"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                className="text-sm rounded-md w-fit transition-all duration-700 hover:bg-black text-white bg-[#435d63] p-2 font-serif font-semibold"
                onClick={handleActionsClicked}
              >
                Action
              </button>
              {showActions && (
                <div className="overflow-hidden absolute z-10 top-full right-0 rounded-md bg-white w-fit shadow-md">
                  <button
                    className="p-2 px-4 hover:bg-black/10 w-full text-left"
                    onClick={() => {
                      setEditStore(null);
                      setShowForm(true);
                    }}
                  >
                    Create
                  </button>
                  <label className="p-2 px-4 hover:bg-black/10 w-full block cursor-pointer">
                    Import
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      className="hidden"
                      onChange={handleImport}
                    />
                  </label>
                  <button
                    className="p-2 px-4 hover:bg-black/10 w-full text-left"
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
        title="Are you sure you want to delete this store?"
        message="This action can be undone"
        okButtonText="OK"
        cancelButtonText="Cancel"
      />

      <ToastContainer />
    </>
  );
};

export default Stores;