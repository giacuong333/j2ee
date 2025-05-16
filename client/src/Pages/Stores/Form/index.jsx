import React, { useState, useEffect, Suspense } from "react";
import { isEmpty } from "../../../Utils/validation";
import { IoClose } from "react-icons/io5";
import { showToast } from "../../../Components/Toast";
import StoreService from "../../../Services/store";
import UserService from "../../../Services/user";

const FormControl = React.lazy(() => import("../../../Components/FormControl"));
const Overlay = React.lazy(() => import("../../../Components/Overlay"));
const Loading = React.lazy(() => import("../../../Components/Loading"));

const Form = ({ toggle, setToggle, initialData, onSubmit, isDisabled = false }) => {
  const [fields, setFields] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    openTime: "",
    closeTime: "",
    ownerId: "",
    status: "",
  });
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFields({
        name: initialData.name || "",
        description: initialData.description || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        openTime: initialData.openTime || "",
        closeTime: initialData.closeTime || "",
        ownerId: initialData.ownerId?.id ? String(initialData.ownerId.id) : "",
        status: initialData.status || "",
      });
      setErrors({});
      if (initialData.id) {
        fetchImage(initialData.id);
      }
    } else {
      setFields({
        name: "",
        description: "",
        address: "",
        phone: "",
        openTime: "",
        closeTime: "",
        ownerId: "",
        status: "",
      });
      setErrors({});
      setImageUrl(null);
      setFile(null);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await UserService.getUsersByRoleId(2);
        const ownersData = response.data;
        setOwners(Array.isArray(ownersData) ? ownersData : []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách chủ cửa hàng:", error);
        showToast("Không thể tải danh sách chủ cửa hàng", "error");
        setOwners([]);
      }
    };
    fetchOwners();
  }, []);

  const fetchImage = async (storeId) => {
    try {
      const response = await StoreService.getStoreImage(storeId);
      const url = URL.createObjectURL(response.data);
      setImageUrl(url);
    } catch (error) {
      console.error("Lỗi khi lấy ảnh:", error);
      showToast("Không thể tải ảnh cửa hàng", "error");
    }
  };

  const handleFieldsChange = (key, value) => {
    if (!isDisabled) {
      setFields((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleFileChange = (e) => {
    if (!isDisabled && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      setErrors((prev) => ({ ...prev, image: "" }));
      if (!validTypes.includes(selectedFile.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Chỉ hỗ trợ file PNG, JPG, JPEG",
        }));
        setFile(null);
        setImageUrl(null);
        return;
      }
      
      if (selectedFile.size > 1 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "File không được lớn hơn 1MB",
        }));
        return;
      }
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleFieldsType = (key) => {
    if (!isDisabled) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleFieldsBlur = (key, message) => {
    if (!isDisabled) {
      setErrors((prev) => ({ ...prev, [key]: message }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (isEmpty(fields.name)) newErrors.name = "Name is required";
    if (isEmpty(fields.description)) newErrors.description = "Description is required";
    if (isEmpty(fields.address)) newErrors.address = "Address is required";
    if (isEmpty(fields.phone)) newErrors.phone = "Phone number is required";
    if (isEmpty(fields.openTime)) newErrors.openTime = "Opening time is required";
    if (isEmpty(fields.closeTime)) newErrors.closeTime = "Closing time is required";
    if (isEmpty(fields.ownerId)) newErrors.ownerId = "Store owner is required";
    if (isEmpty(fields.status)) newErrors.status = "Status is required";

    if (fields.phone) {
      const phoneRegex = /^\d+$/;
      if (!phoneRegex.test(fields.phone)) {
        newErrors.phone = "Phone number must contain only digits";
      } else if (fields.phone.length !== 10) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      }
    }

    if (fields.openTime && fields.closeTime) {
      const open = new Date(`1970-01-01T${fields.openTime}:00`);
      const close = new Date(`1970-01-01T${fields.closeTime}:00`);
      if (open >= close) {
        newErrors.closeTime = "Closing time must be after opening time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDisabled || !validateForm() || pending) return;

    setPending(true);
    try {
      const storeData = {
        name: fields.name,
        description: fields.description,
        address: fields.address,
        phone: fields.phone,
        openTime: fields.openTime,
        closeTime: fields.closeTime,
        ownerId: fields.ownerId ? { id: Number(fields.ownerId) } : null,
        status: fields.status,
      };

      let response;
      if (initialData) {
        response = await StoreService.updateStore(initialData.id, storeData, file);
      } else {
        if (!file) {
          showToast("Please select a store image", "error");
          setPending(false);
          return;
        }
        response = await StoreService.createStore(storeData, file);
      }

      if (response && response.data) {
        onSubmit(response.data);
        showToast(initialData ? "Cập nhật thành công" : "Tạo thành công", "success");
        setToggle(false);
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      showToast(
        "Lỗi khi lưu: " + (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <Overlay toggle={toggle} setToggle={setToggle} />
      <section
        className={`
          ${
            toggle ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          } fixed inset-0 z-40 flex justify-center pt-8 pb-4 overflow-y-auto`}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white max-w-md w-full rounded p-6 min-h-fit"
        >
          <div className="flex items-center justify-between w-full mb-4">
            <p className="font-semibold text-lg">
              {isDisabled
                ? "Thông tin cửa hàng"
                : initialData
                ? "Chỉnh sửa cửa hàng"
                : "Tạo cửa hàng"}
            </p>
            <IoClose size={26} className="cursor-pointer" onClick={() => setToggle(false)} />
          </div>

          <div className="space-y-4">
            {!isDisabled && (
              <div>
                <label className="block mb-1 font-serif font-medium">Ảnh cửa hàng</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded"
                  disabled={isDisabled}
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
              </div>
            )}

            {imageUrl && (
              <div className="mt-4">
                <label className="block mb-1 font-serif font-medium">Xem trước ảnh</label>
                <img
                  src={imageUrl}
                  alt={fields.name || "Store Image"}
                  className="w-32 h-32 object-cover rounded-md"
                />
              </div>
            )}

            <FormControl
              type="text"
              placeHolder="Enter Name"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="name"
              label="Name"
              labelStyle="mb-1 font-serif"
              value={fields.name}
              onChange={(event) => handleFieldsChange("name", event.target.value)}
              onType={() => handleFieldsType("name")}
              onBlur={() =>
                isEmpty(fields.name) && handleFieldsBlur("name", "Name is required")
              }
              hasError={!!errors.name}
              errorMessage={errors.name}
              disabled={isDisabled}
            />

            <FormControl
              type="textarea"
              placeHolder="Enter description"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="description"
              label="Description"
              labelStyle="mb-1 font-serif"
              value={fields.description}
              onChange={(event) => handleFieldsChange("description", event.target.value)}
              onType={() => handleFieldsType("description")}
              onBlur={() =>
                isEmpty(fields.description) &&
                handleFieldsBlur("description", "Description is required")
              }
              disabled={isDisabled}
              hasError={!!errors.description}
              errorMessage={errors.description}
            />

            <FormControl
              type="text"
              placeHolder="Enter address"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="address"
              label="Address"
              labelStyle="mb-1 font-serif"
              value={fields.address}
              onChange={(event) => handleFieldsChange("address", event.target.value)}
              onType={() => handleFieldsType("address")}
              onBlur={() =>
                isEmpty(fields.address) && handleFieldsBlur("address", "Address is required")
              }
              disabled={isDisabled}
              hasError={!!errors.address}
              errorMessage={errors.address}
            />

            <FormControl
              type="text"
              placeHolder="Enter phone"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="phone"
              label="Phone"
              labelStyle="mb-1 font-serif"
              value={fields.phone}
              onChange={(event) => handleFieldsChange("phone", event.target.value)}
              onType={() => handleFieldsType("phone")}
              onBlur={() =>
                isEmpty(fields.phone) && handleFieldsBlur("phone", "Phone number is required")
              }
              disabled={isDisabled}
              hasError={!!errors.phone}
              errorMessage={errors.phone}
            />

            <FormControl
              type="time"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="openTime"
              label="Opening time"
              labelStyle="mb-1 font-serif"
              value={fields.openTime}
              onChange={(event) => handleFieldsChange("openTime", event.target.value)}
              onType={() => handleFieldsType("openTime")}
              onBlur={() =>
                isEmpty(fields.openTime) &&
                handleFieldsBlur("openTime", "Opening time is required")
              }
              hasError={!!errors.openTime}
              errorMessage={errors.openTime}
              disabled={isDisabled}
            />

            <FormControl
              type="time"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="closeTime"
              label="Closing time"
              labelStyle="mb-1 font-serif"
              value={fields.closeTime}
              onChange={(event) => handleFieldsChange("closeTime", event.target.value)}
              onType={() => handleFieldsType("closeTime")}
              onBlur={() =>
                isEmpty(fields.closeTime) &&
                handleFieldsBlur("closeTime", "Closing time is required")
              }
              hasError={!!errors.closeTime}
              errorMessage={errors.closeTime}
              disabled={isDisabled}
            />

            <FormControl
              type="select"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="ownerId"
              label="Owner"
              labelStyle="mb-1 font-serif"
              value={fields.ownerId}
              onChange={(event) => handleFieldsChange("ownerId", event.target.value)}
              onType={() => handleFieldsType("ownerId")}
              onBlur={() =>
                isEmpty(fields.ownerId) && handleFieldsBlur("ownerId", "Store owner is required")
              }
              hasError={!!errors.ownerId}
              errorMessage={errors.ownerId}
              disabled={isDisabled}
              options={[
                { value: "", label: "Choose owner" },
                ...(Array.isArray(owners) ? owners : []).map((owner) => ({
                  value: String(owner.id),
                  label: owner.name,
                })),
              ]}
            />

            <FormControl
              type="select"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="status"
              label="Status"
              labelStyle="mb-1 font-serif"
              value={fields.status}
              onChange={(event) => handleFieldsChange("status", event.target.value)}
              onType={() => handleFieldsType("status")}
              onBlur={() =>
                isEmpty(fields.status) && handleFieldsBlur("status", "Status is required")
              }
              hasError={!!errors.status}
              errorMessage={errors.status}
              disabled={isDisabled}
              options={[
                { value: "", label: "Choose status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>

          <div className="flex items-center gap-4 mt-6">
            {!isDisabled && (
              <>
                <button
                  type="button"
                  className="transition-all duration-700 text-black w-full py-2 rounded font-serif font-semibold bg-gray-200 hover:bg-gray-300"
                  onClick={() => setToggle(false)}
                  disabled={pending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="transition-all duration-700 hover:bg-black text-white bg-[#799aa1] w-full py-2 rounded font-serif font-semibold"
                  disabled={pending}
                >
                  {pending ? (
                    <Loading customStyle="flex items-center justify-center" />
                  ) : (
                    <p>{initialData ? "Cập nhật" : "Tạo"}</p>
                  )}
                </button>
              </>
            )}
            {isDisabled && (
              <button
                type="button"
                className="transition-all duration-700 hover:bg-black text-white bg-[#799aa1] w-full py-2 rounded font-serif font-semibold"
                onClick={() => setToggle(false)}
              >
                Close
              </button>
            )}
          </div>
        </form>
      </section>
    </Suspense>
  );
};

export default Form;