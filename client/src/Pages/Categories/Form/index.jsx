import React, { useState, useEffect } from "react";
import { isEmpty } from "../../../Utils/validation";
import { IoClose } from "react-icons/io5";
import { showToast } from "../../../Components/Toast";
import CategoryOfServiceService from "../../../Services/categoryOfService";

const FormControl = React.lazy(() => import("../../../Components/FormControl"));
const Overlay = React.lazy(() => import("../../../Components/Overlay"));
const Loading = React.lazy(() => import("../../../Components/Loading"));

const Form = ({ toggle, setToggle, initialData, onSubmit, isDisabled = false }) => {
  const [fields, setFields] = useState({ name: "", status: "", image: null });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; 

  useEffect(() => {
    if (initialData) {
      setFields({
        name: initialData.name || "",
        status: initialData.status || "",
        image: null,
      });
      setErrors({});
      if (initialData.id) {
        CategoryOfServiceService.getCategoryOSImage(initialData.id)
          .then((response) => {
            const url = URL.createObjectURL(response.data);
            setImagePreview(url);
          })
          .catch((error) => {
            console.error("Failed to load image:", error);
            setImagePreview("../../../../src/assets/categoryOfService/default.jpg");
          });
      }
    } else {
      setFields({ name: "", status: "", image: null });
      setErrors({});
      setImagePreview(null);
    }
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [initialData]);

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

  const validateForm = () => {
    let newErrors = {};
    if (isEmpty(fields.name)) {
      newErrors.name = "Name is required";
    }
    if (isEmpty(fields.status)) {
      newErrors.status = "Status is required";
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
      const categoryDTO = {
        name: fields.name,
        status: fields.status,
      };

      let response;
      if (initialData) {
        response = await CategoryOfServiceService.updateCategoryOfServices(
          initialData.id,
          categoryDTO,
          file
        );
      } else {
        response = await CategoryOfServiceService.createCategoryOfServices(
          categoryDTO,
          file
        );
      }

      if (response && response.data) {
        onSubmit(response.data);
        // showToast(
        //   initialData ? "Cập nhật thành công" : "Tạo thành công",
        //   "success"
        // );
        setToggle(false);
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      showToast(
        "Image không phù hợp.Vui lòng chọn ảnh khác! " ,
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
          } fixed inset-0 z-40 flex items-center justify-center lg:px-0 p-4`}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white max-w-md w-full rounded p-6"
        >
          <div className="flex items-center justify-between w-full mb-4">
            <p className="font-semibold text-lg">
              {isDisabled
                ? "Thông tin danh mục"
                : initialData
                ? "Chỉnh sửa danh mục"
                : "Tạo danh mục"}
            </p>
            <IoClose size={26} className="cursor-pointer" onClick={() => setToggle(false)} />
          </div>

          <div className="space-y-4">
            {!isDisabled && (
              <div>
                <label className="block mb-1 font-serif font-medium">
                  Ảnh danh mục
                </label>
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
                <label className="block mb-1 font-serif font-medium">
                  Xem trước ảnh
                </label>
                <img
                  src={imagePreview}
                  alt={fields.name || "Category Image"}
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
                isEmpty(fields.name) &&
                handleFieldsBlur("name", "Name is required")
              }
              hasError={!!errors?.name}
              errorMessage={errors?.name}
              disabled={isDisabled}
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
    </>
  );
};

export default Form;