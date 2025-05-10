import React, { useState, useEffect } from "react";
import { isEmpty } from "../../../../Utils/validation";
import { IoClose } from "react-icons/io5";
import { showToast } from "../../../../Components/Toast";
import ProductService from "../../../../Services/product";

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
    old_price: "",
    stock_quantity: "",
    status: "",
    category: "",
    weight: "", // Thêm trường weight
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // Lấy danh sách category từ API
    const fetchCategories = async () => {
      try {
        const response = await ProductService.getAllCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách category:", error);
      }
    };
    fetchCategories();

    // Nếu có dữ liệu ban đầu (chỉnh sửa sản phẩm)
    if (initialData) {
      setFields({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || "",
        old_price: initialData.old_price || "",
        stock_quantity: initialData.stock_quantity || "",
        status: initialData.status || "",
        category: initialData.category?.id || "",
        weight: initialData.weight || "", // Gán giá trị weight nếu có
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
    if (isEmpty(fields.name)) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (isEmpty(fields.price)) newErrors.price = "Giá là bắt buộc";
    if (isEmpty(fields.stock_quantity))
      newErrors.stock_quantity = "Số lượng tồn kho là bắt buộc";
    if (isEmpty(fields.category)) newErrors.category = "Danh mục Sản Phẩm là bắt buộc";
    if (isEmpty(fields.weight)) newErrors.weight = "Khối lượng là bắt buộc"; // Thêm kiểm tra weight
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
        old_price: parseFloat(fields.old_price) || null,
        stock_quantity: parseInt(fields.stock_quantity, 10),
        status: fields.status,
        weight: parseFloat(fields.weight), 
        category: { id: parseInt(fields.category, 10) },
      };

      let response;
      if (initialData) {
        response = await ProductService.updateProduct(initialData.id, data);
      } else {
        console.log("data", data);
        response = await ProductService.createProduct(data);
      }

      if (response && response.data) {
        onSubmit(response.data);
        setToggle(false);
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      showToast("Lỗi khi lưu sản phẩm", "error");
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
                ? "Thông tin sản phẩm"
                : initialData
                ? "Chỉnh sửa sản phẩm"
                : "Tạo sản phẩm"}
            </p>
            <IoClose size={26} className="cursor-pointer" onClick={setToggle} />
          </div>

          <div className="space-y-4">
            <FormControl
              type="text"
              placeHolder="Nhập tên sản phẩm"
              hasLabel
              id="name"
              label="Tên sản phẩm"
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
              placeHolder="Nhập mô tả sản phẩm"
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
              placeHolder="Nhập giá cũ"
              hasLabel
              id="old_price"
              label="Giá cũ"
              value={fields.old_price}
              onChange={(event) =>
                handleFieldsChange("old_price", event.target.value)
              }
              disabled={isDisabled}
            />

            <FormControl
              type="number"
              placeHolder="Nhập số lượng tồn kho"
              hasLabel
              id="stock_quantity"
              label="Số lượng tồn kho"
              value={fields.stock_quantity}
              onChange={(event) =>
                handleFieldsChange("stock_quantity", event.target.value)
              }
              hasError={!!errors?.stock_quantity}
              errorMessage={errors?.stock_quantity}
              disabled={isDisabled}
            />

            <FormControl
              type="number"
              placeHolder="Nhập khối lượng sản phẩm"
              hasLabel
              id="weight"
              label="Khối lượng(g)"
              value={fields.weight}
              onChange={(event) =>
                handleFieldsChange("weight", event.target.value)
              }
              hasError={!!errors?.weight}
              errorMessage={errors?.weight}
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
              placeHolder="Chọn danh mục"
              hasLabel
              id="category"
              label="Danh mục"
              value={fields.category || ""}
              onChange={(event) =>
                handleFieldsChange("category", event.target.value)
              }
              hasError={!!errors?.category}
              errorMessage={errors?.category}
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