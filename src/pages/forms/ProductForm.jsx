import { useEffect, useState, useCallback } from "react";
import {
  faCircleExclamation,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Form, Input, Select, message } from "antd";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { getProductDetailsFromOpenAI } from "../../hooks/productAddWithOpenAI";
import useAutoPopulateDescription from "../../hooks/useAutoPopulateDescription";
import useAuth from "../../contexts/useAuth";
import ImageUploadSection from "./ImageUpload";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

const ProductForm = ({ initialValues, onCancel, onOk }) => {
  const { userData } = useAuth();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [manufacturerSuggestions, setManufacturerSuggestions] = useState([]);
  const productName = Form.useWatch("productName", form);
  const manufacturerName = Form.useWatch("manufacturerName", form);
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState({});
  const [step2Data, setStep2Data] = useState({});
  const [imageUrl, setImageUrl] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [subvariants, setSubvariants] = useState([]);

  const { description, loading, error } = useAutoPopulateDescription(
    productName,
    manufacturerName
  );

  useEffect(() => {
    if (userData && userData._id) {
      fetchCategories();
      fetchManufacturers();
    }
  }, [userData]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  useEffect(() => {
    if (description) {
      form.setFieldsValue({ description });
    }
  }, [description, form]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "/api/v1/categories"
      );
      setCategories(response.data);
    } catch (error) {
      message.error("Failed to fetch categories 😔");
    }
  };

  const fetchSubcategories = useCallback(async (categoryName) => {
    try {
      const response = await axios.get(
        `/api/v1/categories/${categoryName}/subcategories`
      );
      if (Array.isArray(response.data.subcategories)) {
        setSubcategories(response.data.subcategories);
      } else {
        console.error("Unexpected response format for subcategories");
      }
    } catch (error) {
      message.error("Failed to fetch subcategories 😔");
    }
  }, []);

  const fetchManufacturers = async () => {
    try {
      const response = await axios.get(
        "/api/v1/manufacturer"
      );
      setManufacturers(response.data);
    } catch (error) {
      message.error("Failed to fetch manufacturers 😔");
    }
  };

  const fetchVariants = async () => {
    try {
      const response = await axios.get("/api/v1/variants");
      console.log("Response:", response);
      const variantsData = response.data.data;
      setVariants(Array.isArray(variantsData) ? variantsData : []);
    } catch (error) {
      message.error("Failed to fetch variants 😔");
    }
  };

  useEffect(() => {
    fetchVariants();
  }, []);

  const onManufacturerChange = (value) => {
    const selectedManu = manufacturers.find(
      (manufacturer) => manufacturer.name === value
    );
    setSelectedManufacturer(selectedManu);
    setBrands(selectedManu ? selectedManu.brands : []);
    form.setFieldsValue({ brand: null });
    form.setFieldsValue({ manufacturerName: value });
  };

  const handleSuggestionClick = (suggestion) => {
    const selectedManu = manufacturers.find(
      (manufacturer) => manufacturer.name === suggestion
    );
    setSelectedManufacturer(selectedManu);
    setBrands(selectedManu ? selectedManu.brands : []);
    form.setFieldsValue({ brand: null });

    form.setFields([
      {
        name: "manufacturerName",
        value: suggestion,
      },
    ]);

    setManufacturerSuggestions([]);
  };

  const handleCategoryChange = (value) => {
    fetchSubcategories(value);
  };

  const handleAIButtonClick = async () => {
    const productName = form.getFieldValue("productName");
    if (!productName) {
      message.warning("Please enter the product name first.");
      return;
    }

    try {
      const { productCategory, productSubcategory, manufacturers } =
        await getProductDetailsFromOpenAI(productName);

      form.setFieldsValue({
        productCategory,
        productSubcategory,
      });
      setManufacturerSuggestions(manufacturers);
      message.success("Product details populated using AI 🎉");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch product details using AI 😔";
      message.error(errorMessage);
    }
  };

  const handleNext = () => {
    const currentValues = form.getFieldsValue();
    setStep1Data(currentValues);
    setCurrentStep(2);
  };

  const handlePrevious = () => {
    const currentValues = form.getFieldsValue();
    setStep2Data(currentValues);
    setCurrentStep(1);
  };

  const handleImageUpload = (uploadedImageUrl) => {
    setImageUrl(uploadedImageUrl);
  };

  const onFinish = (values) => {
    const finalData = {
      ...step1Data,
      ...step2Data,
      imageUrl,
      ...values,
      weight: parseFloat(values.weight),
      createdBy: userData.email ? userData.email.toString() : userData._id,
    };
    onOk(finalData);
    console.log("Final Form Data:", finalData);
  };

  return (
    <>
      {userData && (
        <Form form={form} onFinish={onFinish} initialValues={initialValues}>
          {currentStep === 1 && (
            <>
              <ImageUploadSection setImageUrl={handleImageUpload} />
              <p className="formTitle">Product Name</p>
              <Form.Item
                name="productName"
                rules={[
                  {
                    required: true,
                    message: (
                      <div className="validation-error">
                        <ExclamationCircleOutlined /> Please enter the product name
                      </div>
                    ),
                  },
                ]}
              >
                <Input className="userInput" placeholder="Product Name" />
              </Form.Item>
              <p className="formTitle">Manufacturer Name</p>
              <Form.Item
                name="manufacturerName"
                className="userSelection"
                rules={[
                  {
                    required: true,
                    message: (
                      <div className="validation-error">
                        <ExclamationCircleOutlined /> Please enter the manufacturer name
                      </div>
                    ),
                  },
                ]}
              >
                <Select
                  className="userSelection"
                  showSearch
                  placeholder="Nestle"
                  value={form.getFieldValue("manufacturerName")}
                  onChange={onManufacturerChange}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {manufacturers
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((manufacturer) => (
                      <Option key={manufacturer._id} value={manufacturer.name}>
                        {manufacturer.name}
                      </Option>
                    ))}
                </Select>

                {manufacturerSuggestions.length > 0 && (
                  <div style={{ display: "flex" }} className="productForm">
                    {manufacturerSuggestions
                      .slice(0, 4)
                      .map((suggestion, index) => (
                        <Button
                          key={index}
                          type="link"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="AIBtn"
                        >
                          {suggestion}
                        </Button>
                      ))}
                  </div>
                )}
              </Form.Item>

              <div className="aiUseNotification">
                <FontAwesomeIcon 
                  icon={faCircleExclamation} 
                />
                <p>
                  Suggestions made by artificial intelligence may sometimes be inaccurate. 
                  Please check again for data accuracy.
                </p>
              </div>
              <p className="formTitle">Brand</p>
              <Form.Item
                name="brand"
                rules={[
                  {
                    required: true,
                    message: (
                      <div className="validation-error">
                        <ExclamationCircleOutlined /> Please select a brand
                      </div>
                    ),
                  },
                ]}
              >
                <Select
                  className="userSelection"
                  disabled={!selectedManufacturer}
                  placeholder="Milo"
                >
                  {brands.map((brand, index) => (
                    <Option key={index} value={brand}>
                      {brand}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          {currentStep === 2 && (
            <>
              <p className="formTitle">Product Category</p>
              <Form.Item
                name="productCategory"
                rules={[
                  {
                    required: true,
                    message: (
                      <div className="validation-error">
                        <ExclamationCircleOutlined /> Please input the product&apos;s category
                      </div>
                    ),
                  },
                ]}
              >
                <Select
                  className="userSelection"
                  showSearch
                  placeholder="Category (Start typing to search)"
                  onChange={handleCategoryChange}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {categories
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((category) => (
                      <Option key={category._id} value={category.name}>
                        {category.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <p className="formTitle">Product Subcategory</p>
              <Form.Item
                name="productSubcategory"
                rules={[
                  {
                    required: true,
                    message: (
                      <div className="validation-error">
                        <ExclamationCircleOutlined /> Please enter the product subcategory
                      </div>
                    ),
                  },
                ]}
              >
                <Select
                  className="userSelection"
                  placeholder="Product Subcategory"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {subcategories.map((subcategory) => (
                    <Option key={subcategory} value={subcategory}>
                      {subcategory}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <p className="formTitle">Variant Type</p>
              <Form.Item
                name="variantType"
                rules={[
                  {
                    required: true,
                    message: (
                      <div className="validation-error">
                        <ExclamationCircleOutlined /> Please select a variant type
                      </div>
                    ),
                  },
                ]}
              >
                <Select
                  className="userSelection"
                  placeholder="Select Variant Type"
                  showSearch
                  onChange={(value) => {
                    const selected = variants.find(
                      (variant) => variant.name === value
                    );
                    setSelectedVariant(selected);
                    setSubvariants(selected?.subvariants || []);
                  }}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {variants.map((variant) => (
                    <Option key={variant._id} value={variant.name}>
                      {variant.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <p className="formTitle">Variant</p>
              <Form.Item
                name="variant"
                rules={[
                  {
                    required: true,
                    message: (
                      <div className="validation-error">
                        <ExclamationCircleOutlined /> Please enter the variant
                      </div>
                    ),
                  },
                ]}
              >
                {selectedVariant &&
                selectedVariant.subvariants.includes("-") ? (
                  <Input
                    className="userInput"
                    placeholder="Variant"
                    // Add any other props needed
                  />
                ) : (
                  <Select
                    className="userSelection"
                    placeholder="Select Subvariant"
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {subvariants.map((subvariant) => (
                      <Option key={subvariant._id} value={subvariant.name}>
                        {subvariant.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>

              <p className="formTitle">Weight</p>
              <Form.Item
                name="weight"
                rules={[
                  {
                    required: true,
                    message: (
                      <div className="validation-error">
                        <ExclamationCircleOutlined /> Please enter the weight of the product
                      </div>
                    ),
                  },
                ]}
              >
                <Input
                  type="number"
                  className="userInput"
                  placeholder="Weight"
                />
              </Form.Item>

              <p className="formTitle">Product Description</p>
              <Form.Item
                name="description"
                rules={[
                  {
                    required: true,
                    message: (
                      <div className="validation-error">
                        <ExclamationCircleOutlined /> Please enter a product description
                      </div>
                    ),
                  },
                ]}
              >
                <Input.TextArea
                  className="userInput"
                  placeholder="Description"
                />
              </Form.Item>
            </>
          )}
          <>
            <Form.Item className="concludeBtns">
              {currentStep === 1 && (
                <Button
                  type="default"
                  className="editBtn"
                  style={{ marginLeft: "5px" }}
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              {currentStep === 2 && (
                <Button
                  type="default"
                  className="editBtn"
                  style={{ marginLeft: "5px" }}
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}
              {(currentStep === 1 || currentStep === 2) && (
                <Button
                  type="default"
                  loading={loading}
                  onClick={handleAIButtonClick}
                  style={{ marginLeft: "5px" }}
                  className="AIBtn"
                >
                  <FontAwesomeIcon
                    icon={faWandMagicSparkles}
                    style={{ color: "#b76e00" }}
                  />{" "}
                  AI Assist
                </Button>
              )}
              {currentStep === 1 && (
                <Button
                  type="primary"
                  onClick={handleNext}
                  style={{ marginLeft: "5px" }}
                  className="addBtn"
                >
                  Next
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  type="primary"
                  htmlType="submit"
                  className="addBtn"
                  style={{ marginLeft: "5px", marginTop: "10px" }}
                >
                  {initialValues ? "Update Product" : "Create Product"}
                </Button>
              )}
            </Form.Item>
          </>
          {error && <p style={{ color: "red" }}>Error: {error}</p>}
        </Form>
      )}
    </>
  );
};

ProductForm.propTypes = {
  initialValues: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

export default ProductForm;
