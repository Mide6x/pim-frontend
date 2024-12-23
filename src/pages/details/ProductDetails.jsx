import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button,Flex, message, Modal, Form, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isArchived, setIsArchived] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/v1/products/${id}`
        );
        setProduct(response.data);
      } catch (error) {
        message.error("Failed to fetch product details 😔");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleEdit = () => {
    setIsModalVisible(true);
    form.setFieldsValue(product);
  };

  const handleOk = async () => {
    try {
      const updatedProduct = await form.validateFields();
      const productWithImage = { ...updatedProduct, imageUrl: product.imageUrl, createdBy: product.createdBy };
      await axios.put(
        `/api/v1/products/${id}`,
        productWithImage
      );
      setProduct(productWithImage);
      message.success("Product updated successfully 🎉");
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to update product 😔");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleArchive = async () => {
    try {
      await axios.patch(`/api/v1/products/archive/${id}`);
      setIsArchived(true);
      message.success("Product archived successfully 🎉");
    } catch (error) {
      message.error("Failed to archive product 😔");
    }
  };

  const handleUnarchive = async () => {
    try {
      await axios.patch(`/api/v1/products/unarchive/${id}`);
      setIsArchived(false);
      message.success("Product unarchived successfully 🎉");
    } catch (error) {
      message.error("Failed to unarchive product 😔");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/v1/products/${id}`);
      message.success("Product deleted successfully 🎉");
      navigate(-1);
    } catch (error) {
      message.error("Failed to delete product 😔");
    }
  };
  

  if (!product) {
    return   <Flex vertical flex={1} className="content">
    <div className="intro">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="backButton"
      >
        Dashboard
      </Button>
      <h3 style={{marginTop:"20px"}}>loading product details...</h3>
    </div>
    </Flex>
  }

  return (
    <Flex vertical flex={1} className="content">
      <div className="intro">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="backButton"
        >
          Dashboard
        </Button>
        <h2>Product Details</h2>
      </div>
      <div className="details" style={{ marginTop: "20px" }}>
        <div className="infoContainer">
          <div className="infoTitle">
            <div className="titleContent">
              <img
                className="detailsImage"
                src={product.imageUrl}
                alt={product.productName}
              />
              {product?.productName}
                {isArchived ? <span className="archivedStatus">Archived </span> : <span className="activeStatus">Active</span>}
            </div>
            <div className="buttonContainer">
              <Button
                className="editBtn"
                onClick={handleEdit}
              >
                <FontAwesomeIcon icon={faPenToSquare} /> Edit Details
              </Button>
              {isArchived ? (
                <Button
                  className="unarchiveBtn"
                  onClick={handleUnarchive}
                  style={{ marginLeft: "10px" }}
                >
                  Unarchive
                </Button>
              ) : (
                <Button
                  className="archiveBtn"
                  onClick={handleArchive}
                  style={{ marginLeft: "10px" }}
                >
                  Archive
                </Button>
              )}
              <Button
                className="deleteBtn"
                onClick={handleDelete}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div loading={loading} className="detailsTable">
        <div className="productDetails">
          {[
            { label: "Manufacturer", value: product.manufacturerName },
            { label: "Brand", value: product.brand },
            { label: "Category", value: product.productCategory },
            { label: "Subcategory", value: product.productSubcategory },
            { label: "Variant Type", value: product.variantType },
            { label: "Variant", value: product.variant },
            { label: "Weight", value: `${product.weight} Kg` },
            { label: "Description", value: product.description || "No description available" },
            { label: "Created By", value: product.createdBy || "Not available, please contact admin." },
          ].map((item, index) => (
            <p className="productItem" key={index}>
              <strong>{item.label}:</strong> {item.value}
            </p>
          ))}
        </div>
      </div>
      <Modal
        title="Edit Product Details"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleOk} >
        <p className="formTitle">Product Name</p>
          <Form.Item name="productName">
            <Input className="userInput"  />
          </Form.Item>
          <p className="formTitle">Manufacturer</p>
          <Form.Item name="manufacturerName">
            <Input className="userInput"  />
          </Form.Item>
          <p className="formTitle">Product Brand</p>
          <Form.Item name="brand">
            <Input className="userInput"  />
          </Form.Item>
          <p className="formTitle">Product Category</p>
          <Form.Item name="productCategory">
            <Input className="userInput"  />
          </Form.Item>
          <p className="formTitle">Product Subcategory</p>
          <Form.Item name="productSubcategory">
            <Input className="userInput"  />
          </Form.Item>
          <p className="formTitle">Variant</p>
          <Form.Item name="variant">
            <Input className="userInput" />
          </Form.Item>
          <p className="formTitle">Variant Type</p>
          <Form.Item name="variantType">
            <Input className="userInput"  />
          </Form.Item>
          <p className="formTitle">Weight (in Kg)</p>
          <Form.Item name="weight">
            <Input className="userInput" suffix="Kg" onInput={(e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, '');
            }} />
          </Form.Item>
          <p className="formTitle">Product Description</p>
          <Form.Item
            name="description"
            rules={[{ required: false, message: "Enter the product details." }]}
          >
            <Input.TextArea
              className="userInputDesc"
              placeholder="Product Description"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          <Form.Item className="concludeBtns">
            <Button
              className="editBtn"
              onClick={() => setIsModalVisible(false)}
            >
              Cancel
            </Button>
            <Button
              className="addBtn"
              htmlType="submit"
              style={{ marginLeft: "10px" }}
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
};

export default ProductDetails;
