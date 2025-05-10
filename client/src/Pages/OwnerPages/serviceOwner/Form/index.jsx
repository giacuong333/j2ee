import React, { useState, useEffect } from "react";
import { isEmpty } from "../../../../Utils/validation";
import { IoClose } from "react-icons/io5";
import { showToast } from "../../../../Components/Toast";
import ServiceService from "../../../../Services/service";

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
    description: "",
    price: "",
    duration: "",
    status: "",
    category_of_service: "",
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // Lấy danh sách stores và categories từ API
    const fetchData = async () => {
      try {
        const categoryResponse = await ServiceService.getAllCategories();
        setCategories(categoryResponse.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
    fetchData();

    // Nếu có dữ liệu ban đầu (chỉnh sửa service)
    if (initialData) {
      setFields({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || "",
        duration: initialData.duration || "",
        status: initialData.status || "",
        category_of_service: initialData.category_of_service?.id || "",
      });
    }
  }, [initialData]);

  const handleFieldsChange = (key, value) => {
    if (!isDisabled) {
      setFields((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (isEmpty(fields.name)) newErrors.name = "Tên dịch vụ là bắt buộc";
    if (isEmpty(fields.price)) newErrors.price = "Giá là bắt buộc";
    if (isEmpty(fields.duration)) newErrors.duration = "Thời gian là bắt buộc";
    if (isEmpty(fields.category_of_service))
      newErrors.category_of_service = "Danh mục dịch vụ là bắt buộc";
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
        price: parseFloat(fields.price),
        duration: parseInt(fields.duration, 10),
        status: fields.status,
        category_of_service: { id: parseInt(fields.category_of_service, 10) },
      };

      let response;
      if (initialData) {
        response = await ServiceService.updateService(initialData.id, data);
      } else {
        response = await ServiceService.createService(data);
      }

      if (response && response.data) {
        onSubmit(response.data);
        setToggle(false);
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      showToast("Lỗi khi lưu dịch vụ", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Overlay toggle={toggle} setToggle={setToggle} />
      <section
        className={`${
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
                ? "Thông tin dịch vụ"
                : initialData
                ? "Chỉnh sửa dịch vụ"
                : "Tạo dịch vụ"}
            </p>
            <IoClose size={26} className="cursor-pointer" onClick={setToggle} />
          </div>

          <div className="space-y-4">
            <FormControl
              type="text"
              placeHolder="Nhập tên dịch vụ"
              hasLabel
              id="name"
              label="Tên dịch vụ"
              value={fields.name}
              onChange={(event) =>
                handleFieldsChange("name", event.target.value)
              }
              hasError={!!errors?.name}
              errorMessage={errors?.name}
              disabled={isDisabled}
            />

            <FormControl
              type="textarea"
              placeHolder="Nhập mô tả dịch vụ"
              hasLabel
              id="description"
              label="Mô tả"
              value={fields.description}
              onChange={(event) =>
                handleFieldsChange("description", event.target.value)
              }
              disabled={isDisabled}
            />

            <FormControl
              type="number"
              placeHolder="Nhập giá"
              hasLabel
              id="price"
              label="Giá"
              value={fields.price}
              onChange={(event) =>
                handleFieldsChange("price", event.target.value)
              }
              hasError={!!errors?.price}
              errorMessage={errors?.price}
              disabled={isDisabled}
            />

            <FormControl
              type="number"
              placeHolder="Nhập thời gian (phút)"
              hasLabel
              id="duration"
              label="Thời gian (phút)"
              value={fields.duration}
              onChange={(event) =>
                handleFieldsChange("duration", event.target.value)
              }
              hasError={!!errors?.duration}
              errorMessage={errors?.duration}
              disabled={isDisabled}
            />

            <FormControl
              type="select"
              placeHolder="Chọn trạng thái"
              hasLabel
              id="status"
              label="Trạng thái"
              value={fields.status || ""}
              onChange={(event) =>
                handleFieldsChange("status", event.target.value)
              }
              disabled={isDisabled}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
            <FormControl
              type="select"
              placeHolder="Chọn danh mục dịch vụ"
              hasLabel
              id="category_of_service"
              label="Danh mục dịch vụ"
              value={fields.category_of_service || ""}
              onChange={(event) =>
                handleFieldsChange("category_of_service", event.target.value)
              }
              hasError={!!errors?.category_of_service}
              errorMessage={errors?.category_of_service}
              disabled={isDisabled}
              options={[
                ...categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                })),
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