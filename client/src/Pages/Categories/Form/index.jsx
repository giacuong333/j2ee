import React, { useState, useEffect } from "react";
import { isEmpty } from "../../../Utils/validation";
import { IoClose } from "react-icons/io5";
import { showToast } from "../../../Components/Toast";
import CategoryOfServiceService from "../../../Services/categoryOfService";

const FormControl = React.lazy(() => import("../../../Components/FormControl"));
const Overlay = React.lazy(() => import("../../../Components/Overlay"));
const Loading = React.lazy(() => import("../../../Components/Loading"));

const Form = ({ toggle, setToggle, initialData, onSubmit, isDisabled = false }) => {
  const [fields, setFields] = useState({ name: "", status: "" });
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);


  useEffect(() => {
    if (initialData) {
      setFields({
        name: initialData.name || "",
        status: initialData.status || "",
      });
      setPreviewImage(initialData.imageUrl || null);
      setFile(null);
      setErrors({});
    } else {
      setFields({ name: "", status: "" });
      setPreviewImage(null);
      setFile(null);
      setErrors({});
    }
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
      setFile(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
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

   
      const submitData = { categoryDTO, imageFile: file };

   
      let response;
      if (initialData) {
        response = await CategoryOfServiceService.updateCategoryOfServices(
          initialData.id,
          submitData.categoryDTO,
          submitData.imageFile
        );
      } else {
        response = await CategoryOfServiceService.createCategoryOfServices(
          submitData.categoryDTO,
          submitData.imageFile
        );
      }

      if (response && response.data) {
 
        try {
          const imageResponse = await CategoryOfServiceService.getCategoryOSImage(response.data.id);
          response.data.imageUrl = URL.createObjectURL(imageResponse.data);
        } catch (error) {
          response.data.imageUrl = null;
        }
        onSubmit(response.data);
        showToast(initialData ? "Updated successfully" : "Created successfully", "success");
        setToggle(false);
      }
    } catch (error) {
      console.error("Error saving category:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      showToast(
        `Error saving category: ${error.response?.data?.message || error.message}`,
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
                ? "Category Information"
                : initialData
                ? "Edit Category"
                : "Create Category"}
            </p>
            <IoClose size={26} className="cursor-pointer" onClick={setToggle} />
          </div>

          <div className="space-y-4">
            {!isDisabled && (
              <div>
                <label className="block mb-1 font-serif font-medium">Category Image</label>
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

            {previewImage && (
              <div className="mt-4">
                <label className="block mb-1 font-serif font-medium">Image Preview</label>
                <img
                  src={previewImage}
                  alt={fields.name || "Category Image"}
                  className="w-32 h-32 object-cover rounded-md"
                  onError={(e) => {
                    e.target.src = "/src/assets/categoryOfService/default.jpg";
                    console.error("Image not found:", previewImage);
                  }}
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
                  onClick={setToggle}
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