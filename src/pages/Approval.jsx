import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Flex,
  Input,
  Select,
  message,
  Space,
  Tabs,
} from "antd";
import axios from "axios";
import PropTypes from "prop-types";
import { debounce } from "lodash";
import useAuth from "../contexts/useAuth";

const { Option } = Select;
const { TabPane } = Tabs;

const Approval = () => {
  const { userData } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [rejectedApprovals, setRejectedApprovals] = useState([]);
  const [approvedApprovals, setApprovedApprovals] = useState([]);
  const [duplicateApprovals, setDuplicateApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    if (userData && userData._id) {
      fetchApprovals();
    }
  }, [userData]);

  const fetchApprovals = async (search = "") => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/approvals", {
        params: { search },
      });

      const data = response.data;
      setApprovals(data.filter((item) => item.status === "pending"));
      setRejectedApprovals(data.filter((item) => item.status === "rejected"));
      setApprovedApprovals(data.filter((item) => item.status === "approved"));
    } catch (error) {
      console.error("Error fetching approvals:", error);
      message.error("Failed to fetch approvals 😔");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    console.log("Selected rows to be approved:", selectedRows);
    setLoading(true);
    try {
      const approvedItems = selectedRows.map((item) => ({
        ...item,
        status: "approved",
        createdBy: userData.email ? userData.email.toString() : userData._id,
      }));

      await Promise.all(
        approvedItems.map(async (item) => {
          await axios.put(
            `/api/v1/approvals/${item._id}`,
            item,
            {
              headers: {
                'user-email': userData.email // Add user email to headers
              }
            }
          );
        })
      );

      message.success("Selected items approved successfully 🎉");
      fetchApprovals();
    } catch (error) {
      console.error("Error occurred while approving selected items:", error);
      message.error("Failed to approve selected items 😔");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/approvals/${id}`);
      message.success("Approval entry deleted successfully 🎉");
      fetchApprovals();
    } catch (error) {
      message.error("Failed to delete approval entry 😔");
    }
  };

  const handleOk = async (values) => {
    try {
      if (editingItem) {
        await axios.put(
          `/api/v1/approvals/${editingItem._id}`,
          values
        );
        message.success("Approval entry updated successfully 🎉");
      } else {
        await axios.post("/api/v1/approvals", values);
        message.success("Approval entry created successfully 🎉");
      }
      fetchApprovals();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to save approval entry 😔");
    }
  };

  const checkForDuplicates = async (products) => {
    try {
      const response = await axios.post(
        "/api/v1/products/check-duplicates",
        products
      );
      return response.data;
    } catch (error) {
      message.error("Failed to check for duplicates 😔");
      return [];
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const selectedProducts = selectedRows;

      if (selectedProducts.length === 0) {
        message.warning("Please select products to process");
        return;
      }

      // Check for duplicates
      const duplicateNames = await checkForDuplicates(selectedProducts);
      const uniqueProducts = selectedProducts.filter(
        (product) => !duplicateNames.includes(product.productName)
      );
    
      // Format products for bulk creation
      const formattedProducts = uniqueProducts.map(product => ({
        manufacturerName: product.manufacturerName,
        brand: product.brand,
        productCategory: product.productCategory,
        productSubcategory: product.productSubcategory || "",
        productName: product.productName,
        variantType: product.variantType,
        variant: product.variant,
        weight: product.weightInKg,
        weightInKg: product.weightInKg,
        imageUrl: product.imageUrl,
        createdBy: userData.email
      }));

      // Push unique products to database
      if (formattedProducts.length > 0) {
        await axios.post(
          "/api/v1/products/bulk", 
          formattedProducts,
          {
            headers: {
              'user-email': userData.email
            }
          }
        );
        message.success(`${formattedProducts.length} products successfully pushed to database 🎉`);
      }
    
      // Handle duplicates
      if (duplicateNames.length > 0) {
        const duplicateProducts = selectedProducts.filter(
          (product) => duplicateNames.includes(product.productName)
        );
        setDuplicateApprovals(prev => [...prev, ...duplicateProducts]);
        message.warning(`${duplicateNames.length} duplicate products moved to Duplicates tab`);
      }
    
      // Delete processed approvals
      if (selectedProducts.length > 0) {
        await axios.post("/api/v1/approvals/delete-duplicates", { 
          ids: selectedProducts.map(product => product._id)
        }, {
          headers: {
            'user-email': userData.email
          }
        });
      }
      
      await fetchApprovals();
      setSelectedRows([]);
      
    } catch (error) {
      console.error("Failed to process approved products:", error);
      message.error("Failed to process approved products 😔");
    } finally {
      setLoading(false);
    }
  };
  


  const handleSearch = debounce((value) => {
    if (value.length >= 3) {
      fetchApprovals(value);
    } else {
      fetchApprovals();
    }
  }, 300);

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDeleteDuplicates = async () => {
    setLoading(true);
    try {
      const ids = duplicateApprovals.map((product) => product._id);
      await axios.post(
        "/api/v1/approvals/delete-duplicates",
        { ids },
        {
          headers: {
            'user-email': userData.email
          }
        }
      );
      message.success("Duplicate products have been deleted 🎉");
      fetchApprovals();
      setDuplicateApprovals([]);
    } catch (error) {
      console.error("Error deleting duplicates:", error);
      message.error("Failed to delete duplicate products 😔");
    } finally {
      setLoading(false);
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status === "",
    }),
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl) => (
        <img
          src={imageUrl}
          alt="Product Image"
          style={{ width: 100, height: 100, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Manufacturer",
      dataIndex: "manufacturerName",
      key: "manufacturerName",
    },
    {
      title: "Category",
      dataIndex: "productCategory",
      key: "productCategory",
    },
    {
      title: "Variant",
      dataIndex: "variant",
      key: "variant",
    },
    {
      title: "Weight (Kg)",
      dataIndex: "weightInKg",
      key: "weightInKg",
    },
    {
      title: "Image URL",
      dataIndex: "imageUrl",
      key: "imageUrl",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button className="editBtn" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            className="deleteBtn"
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const rejectedColumns = [
    ...columns,
    {
      title: "Rejection Reason",
      dataIndex: "rejectionReason",
      key: "rejectionReason",
    },
  ];

  const duplicateColumns = [
    ...columns,
    {
      title: "Duplicate Status",
      dataIndex: "status",
      key: "status",
      render: () => "Duplicate",
    },
  ];

  return (
    <Flex vertical flex={1} className="content">
      <div>
        <div className="intro">
          <h2>Approvals</h2>
        </div>
        <div className="details">
          <span style={{ margin: "0 8px", marginTop: "60px" }} />
          <div className="searchBarContainer">
            <Input
              placeholder="Search Products by name"
              className="searchBar "
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            className="table"
          >
            <TabPane tab="Pending Approvals" key="pending">
              <Table
                columns={columns}
                dataSource={approvals}
                loading={loading}
                rowKey="_id"
                rowSelection={rowSelection}
                pagination={{ position: ["bottomCenter"] }}
              />
              <span style={{ margin: "0 8px" }} />
              <Button
                type="primary"
                className="spaced archiveBtn"
                onClick={handleBulkApprove}
                  style={{ marginTop: "20px" }}
                disabled={selectedRows.length === 0}
              >
                Approve Selected
              </Button>
            </TabPane>
            <TabPane tab="Approved Products" key="approved">
              <Table
                columns={columns}
                dataSource={approvedApprovals}
                rowSelection={rowSelection}
                loading={loading}
                className="spaced"
                rowKey="_id"
                pagination={{ position: ["bottomCenter"] }}
              />
              <Button
                type="primary"
                onClick={handleConfirm}
                className="spaced addBtn"
                  style={{ marginTop: "20px" }}
                disabled={selectedRows.length === 0}
              >
                Confirm and Push to Database
              </Button>
            </TabPane>
            <TabPane tab="Rejected Products" key="rejected">
              <Table
                columns={rejectedColumns}
                dataSource={rejectedApprovals}
                className="spaced"
                loading={loading}
                rowKey="_id"
                pagination={{ position: ["bottomCenter"] }}
              />
            </TabPane>
            <TabPane tab="Duplicate Products" key="duplicates">
              <Table
                columns={duplicateColumns}
                dataSource={duplicateApprovals}
                loading={loading}
                rowKey="_id"
                className="spaced"
                pagination={{ position: ["bottomCenter"] }}
              />
              <Button
                type="primary"
                onClick={handleDeleteDuplicates}
                className="spaced deleteBtn"
                  style={{ marginTop: "20px" }}
                danger
              >
                Delete Duplicates
              </Button>
            </TabPane>
          </Tabs>
        </div>
        <Modal
          title={editingItem ? "Edit Approval Entry" : "Create Approval Entry"}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <ApprovalForm
            initialValues={editingItem}
            onCancel={handleCancel}
            onOk={handleOk}
          />
        </Modal>
      </div>
    </Flex>
  );
};

const ApprovalForm = ({ initialValues, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [status, setStatus] = useState(initialValues?.status || "pending");

  const fetchManufacturers = useCallback(async () => {
    try {
      const response = await axios.get(
        "/api/v1/manufacturer"
      );
      if (Array.isArray(response.data)) {
        setManufacturers(response.data);
      } else {
        console.error("Unexpected response format for manufacturers");
      }
    } catch (error) {
      message.error("Failed to fetch manufacturers 😔");
    }
  }, []);

  const fetchBrands = useCallback(
    async (manufacturerName) => {
      try {
        const manufacturer = manufacturers.find(
          (m) => m.name === manufacturerName
        );
        if (manufacturer) {
          setBrands(manufacturer.brands);
        } else {
          setBrands([]);
        }
      } catch (error) {
        message.error("Failed to fetch brands 😔");
      }
    },
    [manufacturers]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get("/api/v1/categories");
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error("Unexpected response format for categories");
      }
    } catch (error) {
      message.error("Failed to fetch categories 😔");
    }
  }, []);

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

  useEffect(() => {
    fetchManufacturers();
    fetchCategories();
  }, [fetchManufacturers, fetchCategories]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      if (initialValues.productCategory) {
        fetchSubcategories(initialValues.productCategory);
      }
      if (initialValues.manufacturerName) {
        fetchBrands(initialValues.manufacturerName);
      }
      if (initialValues.status) {
        setStatus(initialValues.status);
      }
    }
  }, [initialValues, form, fetchBrands, fetchSubcategories]);

  const handleManufacturerChange = (value) => {
    fetchBrands(value);
  };

  const handleCategoryChange = (value) => {
    fetchSubcategories(value);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => onOk({ ...values })}
      initialValues={initialValues}
    >
      {initialValues?.imageUrl && (
        <div className="approval-image-preview">
          <img 
            src={initialValues.imageUrl} 
            alt="Product"
            style={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'contain',
              marginBottom: '20px',
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}
          />
        </div>
      )}

      <Form.Item
        label="Product Name"
        name="productName"
        rules={[{ required: true, message: "Please input the product name" }]}
      >
        <Input className="userInput" placeholder="" />
      </Form.Item>
      <Form.Item
        label="Manufacturer (Start typing to search)"
        name="manufacturerName"
        rules={[
          {
            required: true,
            message: "Please input the product's manufacturer",
          },
        ]}
      >
        <Select
          showSearch
          onChange={handleManufacturerChange}
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          placeholder="Select a manufacturer"
        >
          {manufacturers
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((manufacturer) => (
              <Option key={manufacturer._id} value={manufacturer.name}>
                {manufacturer.name}
              </Option>
            ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Brand"
        name="brand"
        rules={[
          { required: true, message: "Please input the product's brand" },
        ]}
      >
        <Select>
          {brands.map((brand, index) => (
            <Option key={index} value={brand}>
              {brand}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="Category (Start typing to search)"
        name="productCategory"
        rules={[
          { required: true, message: "Please input the product's category" },
        ]}
      >
        <Select
          showSearch
          onChange={handleCategoryChange}
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          placeholder="Select a category"
        >
          {categories
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => (
              <Option key={category.name} value={category.name}>
                {category.name}
              </Option>
            ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Subcategory"
        name="productSubcategory"
        rules={[
          { required: true, message: "Please input the product's subcategory" },
        ]}
      >
        <Select>
          {subcategories.map((subcategory) => (
            <Option key={subcategory} value={subcategory}>
              {subcategory}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="Variant"
        name="variant"
        rules={[
          { required: true, message: "Please input the product variant" },
        ]}
      >
        <Input className="userInput" placeholder="" />
      </Form.Item>
      <Form.Item
        label="Weight (Kg)"
        name="weightInKg"
        rules={[
          { required: true, message: "Please input the product's weight" },
        ]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item
        label="Image URL"
        name="imageUrl"
        rules={[
          {
            required: true,
            message: "Please add an image URL (Cloudinary Format)",
          },
        ]}
      >
        <Input className="userInput" placeholder="" />
      </Form.Item>
      <Form.Item label="Status" name="status">
        <Select onChange={handleStatusChange} value={status}>
          <Option value="pending">Pending</Option>
          <Option value="approved">Approved</Option>
          <Option value="rejected">Rejected</Option>
        </Select>
      </Form.Item>
      {status === "rejected" && (
        <Form.Item
          label="Reason for Rejection"
          name="rejectionReason"
          rules={[
            {
              required: true,
              message: "Please provide a reason for rejection",
            },
          ]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      )}
      <Form.Item className="buttonContainer">
        <Button type="default" className="deleteBtn" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" className="addBtn" htmlType="submit">
          {initialValues ? "Update" : "Create"}
        </Button>
      </Form.Item>
    </Form>
  );
};

ApprovalForm.propTypes = {
  initialValues: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};
export default Approval;
