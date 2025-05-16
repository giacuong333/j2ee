import React, { useState, useEffect } from "react";
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
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [owners, setOwners] = useState([]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; 

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
        StoreService.getStoreImage(initialData.id)
          .then((response) => {
            const url = URL.createObjectURL(response.data);
            setImagePreview(url);
          })
          .catch((error) => {
            if (error.response?.status === 401) {
              console.warn(`Unauthorized access to image for store ${initialData.id}`);
            } else {
              console.error("Failed to load store image:", error.response?.data || error.message);
            }
            setImagePreview("/assets/images/store/default.jpg");
          });
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
      setImagePreview(null);
    }
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [initialData]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await UserService.getUsersByRoleId(2);
        const ownersData = response.data;
        setOwners(Array.isArray(ownersData) ? ownersData : []);
      } catch (error) {
        console.error("Error fetching owners:", error.response?.data || error.message);
        showToast("Failed to load store owners", "error");
        setOwners([]);
      }
    };
    fetchOwners();
  }, []);

  const handleFieldsChange = (key, value) => {
    if (!isDisabled) {
      setFields((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleFileChange = (e) => {
    if (!isDisabled && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        showToast("Image size exceeds 5MB. Please select a smaller image.", "error");
        setErrors((prev) => ({ ...prev, image: "Image size too large" }));
        setFile(null);
        setImagePreview(null);
        return;
      }
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
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

  const validatePhone = (phone) => {
    if (isEmpty(phone)) return "Phone number is required";
    const phoneRegex = /^\d+$/;
    if (!phoneRegex.test(phone)) return "Phone number must contain only digits";
    if (phone.length !== 10) return "Phone number must be exactly 10 digits";
    return "";
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
      const phoneError = validatePhone(fields.phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    if (file && file.size > MAX_FILE_SIZE) {
      newErrors.image = "Image size exceeds 5MB";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDisabled || !validateForm() || pending) return;

    setPending(true);
    try {
      const data = {
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
        response = await StoreService.updateStore(initialData.id, data, file);
      } else {
        response = await StoreService.createStore(data, file);
      }

      if (response && response.data) {
      
        onSubmit(response.data);
        // showToast(initialData ? "Updated store successfully" : "Created store successfully", "success");
        setToggle(false);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error saving store:", error.response?.data || error.message);
      showToast(
        "Failed to save store: " + (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <>
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
                ? "Store Information"
                : initialData
                ? "Edit Store"
                : "Create Store"}
            </p>
            <IoClose size={26} className="cursor-pointer" onClick={() => setToggle(false)} />
          </div>

          <div className="space-y-4">
            {!isDisabled && (
              <div>
                <label className="block mb-1 font-serif font-medium">Store Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded"
                  disabled={isDisabled}
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
              </div>
            )}

            {imagePreview && (
              <div className="mt-4">
                <label className="block mb-1 font-serif font-medium">Image Preview</label>
                <img
                  src={imagePreview}
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
              hasError={!!errors?.name}
              errorMessage={errors?.name}
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
              hasError={!!errors?.description}
              errorMessage={errors?.description}
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
              hasError={!!errors?.address}
              errorMessage={errors?.address}
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
              onBlur={() => {
                const phoneError = validatePhone(fields.phone);
                if (phoneError) handleFieldsBlur("phone", phoneError);
              }}
              disabled={isDisabled}
              hasError={!!errors?.phone}
              errorMessage={errors?.phone}
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
              hasError={!!errors?.openTime}
              errorMessage={errors?.openTime}
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
              hasError={!!errors?.closeTime}
              errorMessage={errors?.closeTime}
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
              value={fields.ownerId || ""}
              onChange={(event) => handleFieldsChange("ownerId", event.target.value)}
              onType={() => handleFieldsType("ownerId")}
              onBlur={() =>
                isEmpty(fields.ownerId) &&
                handleFieldsBlur("ownerId", "Owner is required")
              }
              hasError={!!errors?.ownerId}
              errorMessage={errors?.ownerId}
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
                isEmpty(fields.status) &&
                handleFieldsBlur("status", "Status is required")
              }
              hasError={!!errors?.status}
              errorMessage={errors?.status}
              disabled={isDisabled}
              options={[
                { value: "", label: "Choose status" },
                { value: "1", label: "Active" },
                { value: "2", label: "Inactive" },
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
                    <p>{initialData ? "Update" : "Create"}</p>
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
    </>
  );
};

export default Form;