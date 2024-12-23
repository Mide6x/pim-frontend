import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button,Flex, message, Modal, Form, Input, Tabs } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { getProductDetailsFromOpenAI } from "../../hooks/useProductDescription";
import useAuth from "../../contexts/useAuth";

const { TabPane } = Tabs;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState("true");
  const [isArchived, setIsArchived] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading("true");
      try {
        const response = await axios.get(`/api/v1/products/${id}`);
        setProduct(response.data);
        setIsArchived(response.data.isArchived || false);
        form.setFieldsValue(response.data);
      } catch (error) {
        message.error("Failed to fetch product details 😔");
      } finally {
        setLoading("false");
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, form]);

  const handleEdit = () => {
    setIsModalVisible(true);
    form.setFieldsValue(product);
  };

  const handleSubmit = async (values) => {
    try {
      const response = await axios.put(
        `/api/v1/products/${id}`, 
        values,
        {
          headers: {
            'user-email': userData.email
          }
        }
      );
      setProduct(response.data);
      setIsModalVisible(false);
      message.success("Product updated successfully 🎉");
    } catch (error) {
      console.error('Update error:', error);
      message.error("Failed to update product 😔");
    }
  };

  const handleArchive = async () => {
    try {
      await axios.patch(
        `/api/v1/products/archive/${id}`,
        {},
        {
          headers: {
            'user-email': userData.email
          }
        }
      );
      setIsArchived(true);
      message.success("Product archived successfully 🎉");
    } catch (error) {
      message.error("Failed to archive product 😔");
    }
  };

  const handleUnarchive = async () => {
    try {
      await axios.patch(
        `/api/v1/products/unarchive/${id}`,
        {},
        {
          headers: {
            'user-email': userData.email
          }
        }
      );
      setIsArchived(false);
      message.success("Product unarchived successfully 🎉");
    } catch (error) {
      message.error("Failed to unarchive product 😔");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `/api/v1/products/${id}`,
        {
          headers: {
            'user-email': userData.email
          }
        }
      );
      message.success("Product deleted successfully 🎉");
      navigate(-1);
    } catch (error) {
      message.error("Failed to delete product 😔");
    }
  };

  const handleGenerateDescription = async () => {
    try {
      const formValues = form.getFieldsValue();
      console.log('Form values:', formValues);

      if (!formValues.productName || !formValues.manufacturerName) {
        message.warning('Please fill in at least the product name and manufacturer');
        return;
      }

      message.loading('Generating description...', 0);

      const description = await getProductDetailsFromOpenAI(formValues);
      message.destroy();

      console.log('Received description:', description);

      if (description) {
        form.setFieldValue('description', description);
        message.success('Description generated successfully 🎉');
      } else {
        throw new Error('No description received');
      }

    } catch (error) {
      message.destroy();
      console.error('Generation error:', error);
      message.error(error.message || 'Failed to generate description 😔');
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
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          initialValues={product}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Basic Details" key="1">
              <div className="approval-image-preview">
                <img 
                  src={product.imageUrl}
                  alt={product.productName}
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              </div>
              <p className="formTitle">Product Name</p>
              <Form.Item name="productName">
                <Input className="userInput" />
              </Form.Item>
              <p className="formTitle">Manufacturer</p>
              <Form.Item name="manufacturerName">
                <Input className="userInput" />
              </Form.Item>
              <p className="formTitle">Product Brand</p>
              <Form.Item name="brand">
                <Input className="userInput" />
              </Form.Item>
              <p className="formTitle">Product Category</p>
              <Form.Item name="productCategory">
                <Input className="userInput" />
              </Form.Item>
              <p className="formTitle">Product Subcategory</p>
              <Form.Item name="productSubcategory">
                <Input className="userInput" />
              </Form.Item>
            </TabPane>

            <TabPane tab="Additional Details" key="2">
              <p className="formTitle">Variant</p>
              <Form.Item name="variant">
                <Input className="userInput" />
              </Form.Item>
              <p className="formTitle">Variant Type</p>
              <Form.Item name="variantType">
                <Input className="userInput" />
              </Form.Item>
              <p className="formTitle">Weight (in Kg)</p>
              <Form.Item name="weight">
                <Input 
                  className="userInput" 
                  suffix="Kg" 
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                  }} 
                />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <Button
                    className="AIBtn"
                    onClick={handleGenerateDescription}
                    icon={<FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: "#b76e00" }} />}
                  >
                    Generate AI Description
                  </Button>
                  <Button
                    className="editBtn"
                    onClick={() => setIsModalVisible(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="addBtn"
                    htmlType="submit"
                  >
                    Save
                  </Button>
                </div>
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </Flex>
  );
};

export default ProductDetails;
