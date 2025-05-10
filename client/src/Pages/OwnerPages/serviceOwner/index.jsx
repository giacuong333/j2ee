import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { CiSearch } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import ConfirmPopup from "../../../Components/ConfirmPopup/index.jsx";
import { showToast } from "../../../Components/Toast/index.jsx";
import ServiceService from "../../../Services/service";

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
        message="Hành động này không thể hoàn tác"
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

const ServiceOwner = () => {
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
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
    },
    {
      name: "Duration (minutes)",
      selector: (row) => row.duration,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.category_of_service?.name,
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
  const [selectedRows, setSelectedRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editService, setEditService] = useState(null);
  const [showConfirmDeleteSingle, setShowConfirmDeleteSingle] = useState(false);
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await ServiceService.getAllServices();
        console.log("Fetched services:", response);
        setServiceData(response.data);
      } catch (error) {
        showToast("Lỗi khi tải danh sách dịch vụ", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
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
      await ServiceService.deleteMultipleServices(ids);
      setServiceData(
        serviceData.filter((service) => !ids.includes(service.id))
      );
      setSelectedRows([]);
      showToast("Xóa nhiều thành công", "success");
    } catch (error) {
      console.error("Lỗi khi xóa nhiều:", error);
      showToast("Lỗi khi xóa nhiều", "error");
    }
  };

  const handleDeleteSingle = (serviceId) => {
    setServiceIdToDelete(serviceId);
    setShowConfirmDeleteSingle(true);
  };

  const confirmDeleteSingle = async () => {
    try {
      await ServiceService.deleteService(serviceIdToDelete);
      setServiceData(
        serviceData.filter((service) => service.id !== serviceIdToDelete)
      );
      setShowConfirmDeleteSingle(false);
      showToast("Xóa thành công", "success");
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      showToast("Lỗi khi xóa", "error");
    }
  };

  const handleEdit = (service) => {
    setEditService(service);
    setShowForm(true);
  };

  const handleFormSubmit = async (newServiceData) => {
    try {
      if (editService) {
        const response = await ServiceService.updateService(
          editService.id,
          newServiceData
        );
        setServiceData(
          serviceData.map((service) =>
            service.id === editService.id ? response.data : service
          )
        );
        showToast("Cập nhật thành công", "success");
      } else {
        const response = await ServiceService.createService(newServiceData);
        setServiceData([...serviceData, response.data]);
        showToast("Tạo thành công", "success");
      }
      setShowForm(false);
      setEditService(null);
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      showToast("Lỗi khi lưu dịch vụ", "error");
    }
  };

  const filteredData = serviceData.filter((service) =>
    service.name.toLowerCase().includes(searchInput.toLowerCase())
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
              />
            </div>

            <button
              type="button"
              className="text-sm rounded-md w-fit transition-all duration-700 hover:bg-black text-white bg-[#435d63] p-2 font-serif font-semibold"
              onClick={() => {
                setEditService(null);
                setShowForm(true);
              }}
            >
              Tạo mới
            </button>
          </header>

          <main className="mt-4 rounded-md shadow-md overflow-hidden">
            {loading ? (
              <Loading />
            ) : (
              <DataTable
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
              />
            )}
          </main>
        </div>
      </section>

      <Form
        toggle={showForm}
        setToggle={() => {
          setShowForm(false);
          setEditService(null);
        }}
        initialData={editService}
        onSubmit={handleFormSubmit}
        isDisabled={false}
      />

      <ConfirmPopup
        toggle={showConfirmDeleteSingle}
        setToggle={() => setShowConfirmDeleteSingle(false)}
        onOk={confirmDeleteSingle}
        onCancel={() => setShowConfirmDeleteSingle(false)}
        title="Bạn có chắc chắn muốn xóa dịch vụ này không?"
        message="Hành động này không thể hoàn tác"
        okButtonText="OK"
        cancelButtonText="Hủy"
      />
    </>
  );
};

export default ServiceOwner;
