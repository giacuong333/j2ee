import React, { useState, useEffect } from "react";
import { isEmpty } from "../../../../Utils/validation";
import { IoClose } from "react-icons/io5";
import { showToast } from "../../../../Components/Toast";
import UserService from "../../../../Services/user";
import StoreService from "../../../../Services/store";

const FormControl = React.lazy(() =>
  import("../../../../Components/FormControl")
);
const Overlay = React.lazy(() => import("../../../../Components/Overlay"));
const Loading = React.lazy(() => import("../../../../Components/Loading"));

const Form = ({
  toggle,
  setToggle,
  initialData,
  onSubmit,
  isDisabled = false,
}) => {
  const [fields, setFields] = useState({
    name: "",
    address: "",
    phone: "",
    open_time: "",
    close_time: "",
    description: "",
    // image: "",
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFields({
        name: initialData.name || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        open_time: initialData.open_time || "",
        close_time: initialData.close_time || "",
        description: initialData.description || "",
        // image: initialData.image || "",
      });
    } else {
      setFields({
        name: "",
        address: "",
        phone: "",
        open_time: "",
        close_time: "",
        description: "",
        // image: "",
      });
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
      setFields((prev) => ({ ...prev, image: selectedFile.name }));
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
    if (isEmpty(fields.name)) newErrors.name = "Tên là bắt buộc";
    if (isEmpty(fields.address)) newErrors.address = "address là bắt buộc";
    if (isEmpty(fields.OpenTime)) newErrors.OpenTime = "OpenTime là bắt buộc";
    if (isEmpty(fields.CloseTime))
      newErrors.CloseTime = "CloseTime là bắt buộc";
    if (isEmpty(fields.phone)) newErrors.phone = "Số điện thoại là bắt buộc";
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
        address: fields.address,
        phone: fields.phone,
        open_time: fields.open_time,
        close_time: fields.close_time,
        description: fields.description,
        // image: fields.image,
      };
      console.log("Dữ liệu gửi đi:", data); // Log để kiểm tra
      let response;
      if (initialData) {
        response = await StoreService.updateStore(initialData.id, data);
      }

      if (response && response.data) {
        onSubmit(response.data);

        setToggle(false);
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      const errorMessage =
        typeof error === "string"
          ? error
          : error.message || "Lỗi không xác định";
      showToast(`Lỗi khi lưu: ${errorMessage}`, "error");

      if (errorMessage.includes("Phone")) {
        setErrors((prev) => ({ ...prev, phone: errorMessage }));
      }
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
            toggle
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          } fixed inset-0 z-40 flex justify-center pt-8 pb-4 overflow-y-auto`}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white max-w-md w-full rounded p-6 min-h-fit"
        >
          <div className="flex items-center justify-between w-full mb-4">
            <p className="font-semibold text-lg">
              {isDisabled
                ? "Thông tin Store"
                : initialData
                ? "Chỉnh sửa Store"
                : initialData}
            </p>
            <IoClose size={26} className="cursor-pointer" onClick={setToggle} />
          </div>

          <div className="space-y-4">
            <FormControl
              type="text"
              placeHolder="Nhập tên Cửa hàng"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="name"
              label="Tên Cửa hàng"
              labelStyle="mb-1 font-serif"
              value={fields.name}
              onChange={(event) =>
                handleFieldsChange("name", event.target.value)
              }
              onType={() => handleFieldsType("name")}
              onBlur={() =>
                isEmpty(fields.name) &&
                handleFieldsBlur("name", "Tên Cửa hàng là bắt buộc")
              }
              hasError={!!errors?.name}
              errorMessage={errors?.name}
              disabled={isDisabled}
            />
            <FormControl
              type="text"
              placeHolder="Nhập Địa chỉ"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="address"
              label="Tên Địa chỉ"
              labelStyle="mb-1 font-serif"
              value={fields.address}
              onChange={(event) =>
                handleFieldsChange("address", event.target.value)
              }
              onType={() => handleFieldsType("address")}
              onBlur={() =>
                isEmpty(fields.address) &&
                handleFieldsBlur("address", "Địa chỉ là bắt buộc")
              }
              hasError={!!errors?.address}
              errorMessage={errors?.address}
              disabled={isDisabled}
            />

            <FormControl
              type="text"
              placeHolder="Nhập số điện thoại"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="phone"
              label="Số điện thoại"
              labelStyle="mb-1 font-serif"
              value={fields.phone}
              onChange={(event) =>
                handleFieldsChange("phone", event.target.value)
              }
              onType={() => handleFieldsType("phone")}
              onBlur={() =>
                isEmpty(fields.phone) &&
                handleFieldsBlur("phone", "phone là bắt buộc")
              }
              hasError={!!errors?.phone}
              errorMessage={errors?.phone}
              disabled={isDisabled}
            />

            <FormControl
              type="Time"
              value={fields.open_time || ""} // Đảm bảo không để undefined
              onChange={(event) =>
                handleFieldsChange("open_time", event.target.value)
              }
              onBlur={() =>
                isEmpty(fields.open_time) &&
                handleFieldsBlur("open_time", "Open Time là bắt buộc")
              }
              hasError={!!errors?.open_time}
              errorMessage={errors?.open_time}
              disabled={isDisabled}
            />

            <FormControl
              type="Time"
              value={fields.close_time || ""} // Đảm bảo không để undefined
              onChange={(event) =>
                handleFieldsChange("close_time", event.target.value)
              }
              onBlur={() =>
                isEmpty(fields.close_time) &&
                handleFieldsBlur("close_time", "Close Time là bắt buộc")
              }
              hasError={!!errors?.close_time}
              errorMessage={errors?.close_time}
              disabled={isDisabled}
            />

            <FormControl
              type="text"
              placeHolder="Nhập Description"
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="description"
              label="Description"
              labelStyle="mb-1 font-serif"
              value={fields.description}
              onChange={(event) =>
                handleFieldsChange("description", event.target.value)
              }
              onType={() => handleFieldsType("description")}
              disabled={isDisabled}
            />

            {/* <FormControl
              type="file"
              placeHolder={"Nhập Image"}
              wrapInputStyle=""
              inputStyle="placeholder:text-lg text-black placeholder:font-serif"
              hasLabel
              id="Image"
              label="Image"
              labelStyle="mb-1 font-serif"
              value={fields.Image || ""}
              onChange={(event) =>
                handleFieldsChange("Image", event.target.value)
              }
              onType={() => handleFieldsType("Image")}
              disabled={isDisabled}
            /> */}
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
                  Hủy
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
                Đóng
              </button>
            )}
          </div>
        </form>
      </section>
    </>
  );
};

export default Form;
