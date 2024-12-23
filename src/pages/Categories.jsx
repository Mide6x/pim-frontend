import { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Table,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tabs,
  Upload,
} from "antd";
import axios from "axios";
import PropTypes from "prop-types";
import { debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

const { TabPane } = Tabs;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [archivedCategories, setArchivedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("live");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async (search = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        "/api/v1/categories",
        {
          params: { search },
        }
      );
      if (Array.isArray(response.data)) {
        setCategories(response.data.filter((c) => !c.isArchived));
        setArchivedCategories(response.data.filter((c) => c.isArchived));
      } else {
        setCategories([]);
        setArchivedCategories([]);
        message.error("Invalid data format received from server 🤔");
      }
    } catch (error) {
      message.error("Failed to fetch categories 😔");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (info) => {
    const file = info.file;
    if (!file) {
      message.error("No file selected");
      return;
    }
    if (
      !file.type.includes("spreadsheetml.sheet") &&
      !file.type.includes("excel")
    ) {
      message.error("Invalid file type. Please upload an Excel file. 🤔");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      try {
        const wb = XLSX.read(arrayBuffer, { type: "array" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const parsedData = XLSX.utils.sheet_to_json(ws);

        const hasEmptyCategory = parsedData.some(
          (item) => !item["Category"] || item["Category"].trim() === ""
        );
        if (hasEmptyCategory) {
          message.error(
            "Some rows have empty Category values. Please check your file. 🤔"
          );
          return;
        }

        const categoriesToSave = parsedData.map((item) => ({
          name: item["Category"],
          subcategories: item["Subcategories"]
            ? item["Subcategories"]
                .split(",")
                .map((subcategory) => subcategory.trim())
            : [],
        }));

        try {
          await axios.post(
            "/api/v1/categories/bulk-upload",
            { categories: categoriesToSave }
          );
          message.success("Categories uploaded and archived successfully 🎉");
          fetchCategories();
        } catch (error) {
          message.error("Failed to save categories 😔");
          console.error("Error saving categories:", error);
        }
      } catch (error) {
        message.error(
          "Failed to read the file. Ensure it is a valid Excel (XLSX) file. 😔"
        );
        console.error("Error reading file:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("/BulkUploadCategories.xlsx");
      if (!response.ok) throw new Error("File not found");

      const blob = await response.blob();
      saveAs(blob, "BulkUploadCategories.xlsx");
    } catch (error) {
      message.error(`Failed to download template: ${error.message} 😔`);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/categories/${id}`);
      message.success("Category deleted successfully 🎉");
      fetchCategories();
    } catch (error) {
      message.error("Failed to delete category 😔");
    }
  };

  const handleUnarchive = async (category) => {
    try {
      await axios.patch(
        `/api/v1/categories/${category._id}/unarchive`
      );
      message.success("Category unarchived successfully 🎉");
      fetchCategories();
    } catch (error) {
      message.error("Failed to unarchive category 😔");
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    try {
      if (editingCategory) {
        await axios.put(
          `/api/v1/categories/${editingCategory._id}`,
          values
        );
        message.success("Category updated successfully 🎉");
      } else {
        await axios.post("/api/v1/categories", values);
        message.success("Category created successfully 🎉");
      }
      fetchCategories();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to save category 😔");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSearch = debounce((value) => {
    if (value.length >= 3) {
      fetchCategories(value);
    } else {
      fetchCategories();
    }
  }, 300);

  const handleSpeechResult = (transcript) => {
    setSearchTerm(transcript);
    handleSearch(transcript);
  };

  const handleMicClick = useSpeechRecognition(handleSpeechResult);

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link className="nameListing" to={`/categories/${record._id}`}>
          {text}
        </Link>
      ),
    },
    {
      title: "Subcategories",
      dataIndex: "subcategories",
      key: "subcategories",
      render: (subcategories) =>
        subcategories.map((sub) => <div key={sub}>{sub}</div>),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button className="editBtn" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Link to={`/categories/${record._id}`}>
            <Button className="archiveBtn">View Details</Button>
          </Link>
        </Space>
      ),
    },
  ];

  const archivedColumns = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Subcategories",
      dataIndex: "subcategories",
      key: "subcategories",
      render: (subcategories) =>
        subcategories.map((sub) => <div key={sub}>{sub}</div>),
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
            className="unarchiveBtn"
            onClick={() => handleUnarchive(record)}
          >
            Unarchive
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

  return (
    <Flex vertical flex={1} className="content">
      <div>
        <div className="intro">
          <h2>Categories</h2>
        </div>
        <div className="details">
          <span style={{ margin: "0 8px", marginTop: "60px" }} />
          <div className="searchBarContainer">
            <div className="searchBarWrapper" style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Input
                className="searchBar"
                placeholder="Search Categories by name"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                }}
                style={{ width: "100%" }}
              />
              <FontAwesomeIcon
                icon={faMicrophone}
                size="lg"
                style={{
                  color: "#616a73",
                  marginLeft: "-40px",
                  zIndex: "3",
                  cursor: "pointer",
                }}
                onClick={handleMicClick}
              />
            </div>
            <Button type="primary" className="addBtn" onClick={handleDownload}>
              Download Excel Template
            </Button>
            <Upload
              name="file"
              accept=".xlsx, .xls"
              beforeUpload={() => false}
              onChange={handleUpload}
              showUploadList={false}
            >
              <Button type="primary" className="archiveBtn">
                <FontAwesomeIcon
                  icon={faFileArrowUp}
                  size="lg"
                  style={{ color: "#008162" }}
                />
                Bulk Upload Categories
              </Button>
            </Upload>
            <Button className="addBtn" type="primary" onClick={handleCreate}>
              Add New Category
            </Button>
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            className="table"
          >
            <TabPane tab="Live Categories" key="live">
              <Table
                columns={columns}
                dataSource={categories}
                loading={loading}
                rowKey="_id"
                className="table"
                pagination={{ position: ["bottomCenter"] }}
              />
            </TabPane>
            <TabPane tab="Archived Categories" key="archived">
              <Table
                columns={archivedColumns}
                dataSource={archivedCategories}
                loading={loading}
                rowKey="_id"
                pagination={{ position: ["bottomCenter"] }}
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
      {categories.length === 0 && !loading && <p>No categories found.</p>}

      <Modal
        title={editingCategory ? "Edit Category" : "Create Category"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <CategoryForm
          initialValues={editingCategory}
          onCancel={handleCancel}
          onOk={handleOk}
        />
      </Modal>
    </Flex>
  );
};

const CategoryForm = ({ initialValues, onCancel, onOk }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  const onFinish = (values) => {
    onOk(values);
  };

  return (
    <Form form={form} onFinish={onFinish} initialValues={initialValues}>
      <p className="formTitle">Category Name</p>
      <Form.Item
        name="name"
        rules={[{ required: true, message: "Please enter the category name" }]}
      >
        <Input className="userInput" placeholder=" Category Name" />
      </Form.Item>
      <p className="formTitle">Subcategories</p>
      <Form.Item
        name="subcategories"
        rules={[{ required: true, message: "Please enter the subcategories" }]}
      >
        <Input className="userInput" placeholder="Subcategories" />
      </Form.Item>
      <Form.Item>
        <Button className="deleteBtn" type="default" onClick={onCancel}>
          Cancel
        </Button>
        <span style={{ margin: "0 8px" }} />
        <Button className="addBtn" type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

CategoryForm.propTypes = {
  initialValues: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

export default Categories;
