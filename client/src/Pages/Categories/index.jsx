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
import CategoryOfServiceService from "../../Services/categoryOfService";
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
        title="Are you sure you want to delete these categories?"
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

const Categories = () => {
  const [searchInput, setSearchInput] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [categoryOSsData, setCategoryOSsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCategoryOS, setEditCategoryOS] = useState(null);
  const [showConfirmDeleteSingle, setShowConfirmDeleteSingle] = useState(false);
  const [categoryOSIdToDelete, setCategoryOSIdToDelete] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [imageCache, setImageCache] = useState({});

  const columns = [
    {
      name: "Image",
      sortable: true,
      cell: (row) => (
        <img
          src={imageCache[row.id] || "/assets/images/categoryOfService/default.jpg"}
          alt={row.name || "Category"}
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
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await CategoryOfServiceService.getAllCategoryOfServices();
        const categories = response.data;
        setCategoryOSsData(categories);
        setFilteredData(categories);

      
        const imagePromises = categories.map(async (category) => {
          try {
            const imageResponse = await CategoryOfServiceService.getCategoryOSImage(category.id);
            const imageUrl = URL.createObjectURL(imageResponse.data);
            return { id: category.id, url: imageUrl };
          } catch (error) {
            console.error(`Failed to load image for category ${category.id}:`, error);
            return { id: category.id, url: "/assets/images/categoryOfService/default.jpg" };
          }
        });

        const imageResults = await Promise.all(imagePromises);
        const newImageCache = imageResults.reduce((acc, { id, url }) => {
          acc[id] = url;
          return acc;
        }, {});
        setImageCache(newImageCache);
      } catch (error) {
        showToast("Failed to load categories", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();

    return () => {
   
      Object.values(imageCache).forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);

  useEffect(() => {
    const filtered = categoryOSsData.filter((item) =>
      item.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchInput, categoryOSsData]);

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
      await CategoryOfServiceService.deleteMultipleCategoryOfServices(ids);
      setCategoryOSsData(categoryOSsData.filter((category) => !ids.includes(category.id)));
      setSelectedRows([]);
      showToast("Deleted multiple categories successfully", "success");
    } catch (error) {
      console.error("Error deleting multiple categories:", error);
      showToast("Failed to delete multiple categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingle = (categoryOSId) => {
    setCategoryOSIdToDelete(categoryOSId);
    setShowConfirmDeleteSingle(true);
  };

  const confirmDeleteSingle = async () => {
    try {
      setLoading(true);
      await CategoryOfServiceService.deleteCategoryOfService(categoryOSIdToDelete);
      setCategoryOSsData(categoryOSsData.filter((category) => category.id !== categoryOSIdToDelete));
      setShowConfirmDeleteSingle(false);
      showToast("Deleted category successfully", "success");
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast("Failed to delete category", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (categoryOfService) => {
    setEditCategoryOS(categoryOfService);
    setShowForm(true);
  };

  const handleFormSubmit = async (newCategoryData) => {
    try {
      setLoading(true);
      let imageUrl = imageCache[newCategoryData.id] || "/assets/images/categoryOfService/default.jpg";
      
   
      try {
        const imageResponse = await CategoryOfServiceService.getCategoryOSImage(newCategoryData.id);
        imageUrl = URL.createObjectURL(imageResponse.data);
      } catch (error) {
        console.error(`Failed to load image for category ${newCategoryData.id}:`, error);
      }

      setCategoryOSsData((prev) => {
        if (editCategoryOS) {
          return prev.map((category) =>
            category.id === editCategoryOS.id ? newCategoryData : category
          );
        }
        return [...prev, newCategoryData];
      });

      setFilteredData((prev) => {
        if (editCategoryOS) {
          return prev.map((category) =>
            category.id === editCategoryOS.id ? newCategoryData : category
          );
        }
        return [...prev, newCategoryData];
      });

      setImageCache((prev) => ({
        ...prev,
        [newCategoryData.id]: imageUrl,
      }));

      showToast(editCategoryOS ? "Updated category successfully" : "Created category successfully", "success");
    } catch (error) {
      console.error("Error in form submission:", error);
      showToast("Failed to save category", "error");
    } finally {
      setShowForm(false);
      setEditCategoryOS(null);
      setLoading(false);
    }
  };

  const handleRowClicked = (row) => {
    setSelectedRow(row);
  };

  const handleActionsClicked = () => {
    setShowActions(!showActions);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        for (const item of jsonData) {
          const categoryDTO = {
            name: item.Name,
            status: item.Status === "Active" ? "1" : "2",
          };
          await CategoryOfServiceService.createCategoryOfServices(categoryDTO, null);
        }

        const response = await CategoryOfServiceService.getAllCategoryOfServices();
        setCategoryOSsData(response.data);
        setFilteredData(response.data);
        showToast("Imported categories successfully", "success");
      } catch (error) {
        console.error("Error importing categories:", error);
        showToast("Failed to import categories", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    const exportData = categoryOSsData.map((item) => ({
      ID: item.id,
      Name: item.name,
      Status: item.status === "1" ? "Active" : "Inactive",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
    XLSX.writeFile(workbook, "Categories_Export.xlsx");
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
                      setEditCategoryOS(null);
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
          setEditCategoryOS(null);
        }}
        initialData={editCategoryOS}
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
        title="Are you sure you want to delete this category?"
        message="This action can be undone"
        okButtonText="OK"
        cancelButtonText="Cancel"
      />

      <ToastContainer />
    </>
  );
};

export default Categories;