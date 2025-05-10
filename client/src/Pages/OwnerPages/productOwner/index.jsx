import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { isEmpty } from "../../../Utils/validation.js";
import { CiSearch } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import ConfirmPopup from "../../../Components/ConfirmPopup/index.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../../Components/Toast/index.jsx";
import ProductService from "../../../Services/product";

const FormControl = React.lazy(() =>
  import("../../../Components/FormControl/index.jsx")
);
const Loading = React.lazy(() =>
  import("../../../Components/Loading/index.jsx")
);
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
        title="Bạn có chắc chắn muốn xóa không?"
        message="Hành động này có thể được hoàn tác"
        okButtonText="OK"
        cancelButtonText="Hủy"
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

const ProductOwner = () => {
  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
    },
    {
        name:"weight",
        selector: (row) => row.weight,
        sortable: true,
    },
    {
      name: "Old Price",
      selector: (row) => row.old_price,
      sortable: true,
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Stock Quantity",
      selector: (row) => row.stock_quantity,
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.category?.name, 
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
  const [ProductData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [showConfirmDeleteSingle, setShowConfirmDeleteSingle] = useState(false);
  const [ProductIdToDelete, setProductIdToDelete] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getAllbyStoreId();
        console.log(response.data);
        setProductData(response.data);
      } catch (error) {
        showToast("Lỗi khi tải danh sách", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const handleFieldsChange = (key, value) => {
    setSearchInput(value);
  };

  const handleRowsSelected = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  const handleDeleteMultiple = async () => {
    const ids = selectedRows.map((row) => row.id);
    try {
      await ProductService.deleteMultipleProducts(ids);
      setProductData(
        ProductData.filter((product) => !ids.includes(product.id))
      );
      setSelectedRows([]);
      showToast("Xóa nhiều thành công", "success");
    } catch (error) {
      console.error("Lỗi khi xóa nhiều:", error);
      showToast("Lỗi khi xóa nhiều", "error");
    }
  };

  const handleDeleteSingle = (userId) => {
    setProductIdToDelete(userId);
    setShowConfirmDeleteSingle(true);
  };

  const confirmDeleteSingle = async () => {
    try {
      await ProductService.deleteProduct(ProductIdToDelete);
      setProductData(
        ProductData.filter((store) => store.id !== ProductIdToDelete)
      );
      setShowConfirmDeleteSingle(false);
      showToast("Xóa thành công", "success");
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      showToast("Lỗi khi xóa", "error");
    }
  };

  const handleEdit = (store) => {
    setEditProduct(store);
    setShowForm(true);
  };

  const handleFormSubmit = async (newProductData) => {
    try {
      if (editProduct) {
        const response = await ProductService.updateProduct(
          editProduct.id,
          newProductData
        );
        setProductData(
          ProductData.map((product) =>
            product.id === editProduct.id ? response.data : product
          )
        );
        showToast("Cập nhật thành công", "success");
      } else {
        const response = await ProductService.createProduct(newProductData);
        setProductData([...ProductData, response.data]);
        showToast("Tạo thành công", "success");
      }
      setShowForm(false);
      setEditProduct(null);
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error.message || "Lỗi không xác định";
      showToast(`Lỗi khi lưu: ${errorMessage}`, "error");
    }
  };

  const handleRowClicked = (row) => {
    setSelectedRow(row);
  };

  const handleActionsClicked = () => {
    setShowActions(!showActions);
  };

  const filteredData = ProductData.filter((product) =>
    product.name.toLowerCase().includes(searchInput.toLowerCase())
  );

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
                onChange={(event) =>
                  handleFieldsChange("search", event.target.value)
                }
                hasButton
                Icon={CiSearch}
                iconSize={24}
                iconStyle="transition-all text-[#435d63] hover:text-black mx-4"
                hasError={errors?.searchInput}
                errorMessage={errors?.searchInput}
              />
            </div>

            <div className="relative">
              <button
                type="button"
                className="text-sm rounded-md w-fit transition-all duration-700 hover:bg-black text-white bg-[#435d63] p-2 font-serif font-semibold"
                onClick={handleActionsClicked}
              >
                <p>Hành động</p>
              </button>
              {showActions && (
                <div className="overflow-hidden absolute z-10 top-full right-0 rounded-md bg-white w-fit shadow-md">
                  <button
                    className="p-2 px-4 hover:bg-black/10 w-full"
                    onClick={() => {
                      setEditProduct(null);
                      setShowForm(true);
                    }}
                  >
                    Tạo mới
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
          setEditProduct(null);
        }}
        initialData={editProduct}
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
        title="Bạn có chắc chắn muốn xóa Product này không?"
        message="Hành động này có thể được hoàn tác"
        okButtonText="OK"
        cancelButtonText="Hủy"
      />
    </>
  );
};

export default ProductOwner;
