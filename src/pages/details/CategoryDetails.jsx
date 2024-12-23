import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Table, message, Input, Button, Form, Flex, Modal, Space } from "antd";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileArrowUp,
  faPenToSquare,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { ArrowLeftOutlined } from "@ant-design/icons";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";

const CategoryDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isArchived, setIsArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCategoryEdit, setIsCategoryEdit] = useState(false);
  const [subcategoriesList, setSubcategoriesList] = useState([]);
  const [archivedSubcategoriesList, setArchivedSubcategoriesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
 
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/v1/categories/${id}`
        );
        setCategory(response.data);
        setIsArchived(response.data.isArchived);
        setSubcategoriesList(response.data.subcategories);
        setArchivedSubcategoriesList(response.data.archivedSubcategories || []);
      } catch (error) {
        message.error("Failed to fetch category details 😔");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [id]);

  const handleEdit = (item, isCategory = false) => {
    setEditingItem(item);
    setIsCategoryEdit(isCategory);
    setIsModalVisible(true);
    form.setFieldsValue(
      isCategory ? { categoryName: item.name } : { subcategoryName: item }
    );
  };

  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();
      if (isCategoryEdit) {
        await axios.put(`/api/v1/categories/${id}`, {
          ...category,
          name: values.categoryName,
        });
        setCategory((prev) => ({ ...prev, name: values.categoryName }));
        message.success("Category updated successfully! 🎉");
      } else {
        await axios.post(`/api/v1/categories/${id}/subcategories`, {
          subcategory: values.subcategoryName,
        });
        
        setCategory((prev) => ({
          ...prev,
          subcategories: [...prev.subcategories, values.subcategoryName],
        }));
        message.success("Subcategory added successfully! 🎉");
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update item 😔");
    }
  };

  const handleArchive = async () => {
    try {
      await axios.patch(
        `/api/v1/categories/${id}/archive`
      );
      setIsArchived(true);
      message.success("Category archived successfully 🎉");
    } catch (error) {
      message.error("Failed to archive category 😔");
    }
  };

  const handleUnarchive = async () => {
    try {
      await axios.patch(
        `/api/v1/categories/${id}/unarchive`
      );
      setIsArchived(false);
      message.success("Category unarchived successfully 🎉");
    } catch (error) {
      message.error("Failed to unarchive category 😔");
    }
  };

  const handleSearch = (value) => {
    if (value.length >= 3) {
      const filteredSubcategories = category.subcategories.filter(
        (subcategories) =>
          subcategories.toLowerCase().includes(value.toLowerCase())
      );
      setSubcategoriesList(filteredSubcategories);
    } else {
      setSubcategoriesList(category.subcategories);
    }
  };
  const handleCreate = () => {
    form.setFieldsValue({ subcategoryName: '' });
    setEditingItem(null);
    setIsCategoryEdit(false);
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/v1/categories/${id}`);
      message.success("Category deleted successfully 🎉");
    } catch (error) {
      message.error("Failed to delete category 😔");
    }
  };

  const handleDeleteSubcategory = async (subcategoryName) => {
    try {
      await axios.delete(`/api/v1/categories/${id}/subcategories`, {
        data: { subcategory: subcategoryName }
      });
      setCategory(prev => ({
        ...prev,
        subcategories: prev.subcategories.filter(sub => sub !== subcategoryName)
      }));
      setSubcategoriesList(prev => prev.filter(sub => sub !== subcategoryName));
      message.success("Subcategory deleted successfully 🎉");
    } catch (error) {
      message.error("Failed to delete subcategory 😔");
    }
  };

  const handleArchiveSubcategory = async (subcategoryName) => {
    try {
      await axios.patch(`/api/v1/categories/${id}/subcategories/archive`, {
        subcategory: subcategoryName
      });
      setCategory(prev => ({
        ...prev,
        subcategories: prev.subcategories.filter(sub => sub !== subcategoryName)
      }));
      setSubcategoriesList(prev => prev.filter(sub => sub !== subcategoryName));
      message.success("Subcategory archived successfully 🎉");
    } catch (error) {
      message.error("Failed to archive subcategory 😔");
    }
  };

  const handleUnarchiveSubcategory = async (subcategoryName) => {
    try {
      await axios.patch(`/api/v1/categories/${id}/subcategories/unarchive`, {
        subcategory: subcategoryName
      });
      setArchivedSubcategoriesList(prev => prev.filter(sub => sub !== subcategoryName));
      setCategory(prev => ({
        ...prev,
        subcategories: [...prev.subcategories, subcategoryName]
      }));
      setSubcategoriesList(prev => [...prev, subcategoryName]);
      message.success("Subcategory unarchived successfully 🎉");
    } catch (error) {
      message.error("Failed to unarchive subcategory 😔");
    }
  };

  const handleSpeechResult = (transcript) => {
    setSearchTerm(transcript);
    handleSearch(transcript);
  };

  const handleMicClick = useSpeechRecognition(handleSpeechResult);

  const columns = [
    {
      title: "Subcategory",
      dataIndex: "subcategory",
      key: "subcategory",
      className: "nameListing",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            className="editBtn"
            onClick={() => handleEdit(record.subcategory)}
          >
            <FontAwesomeIcon icon={faPenToSquare} /> Edit
          </Button>
          <Button
            className="archiveBtn"
            onClick={() => handleArchiveSubcategory(record.subcategory)}
          >
            Archive
          </Button>
          <Button
            className="deleteBtn"
            onClick={() => handleDeleteSubcategory(record.subcategory)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const archivedColumns = [
    {
      title: "Subcategory",
      dataIndex: "subcategory",
      key: "subcategory",
      className: "nameListing",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            className="unarchiveBtn"
            onClick={() => handleUnarchiveSubcategory(record.subcategory)}
          >
            Unarchive
          </Button>
          <Button
            className="deleteBtn"
            onClick={() => handleDeleteSubcategory(record.subcategory)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      label: "Subcategories",
      key: "1",
      children: (
        <>
          <div className="searchBarContainer">
            <div className="searchBarWrapper" style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Input
                placeholder="Search Subcategories by name"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                }}
                style={{ width: "100%" }}
                className="searchBar"
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
            <Button
              type="primary"
              className="archiveBtn"
              onClick={handleCreate}
            >
              <FontAwesomeIcon
                icon={faFileArrowUp}
                size="lg"
                style={{ color: "#008162" }}
              />
              Bulk Upload Subcategory
            </Button>
            <Button type="primary" className="addBtn" onClick={handleCreate}>
              Add New Subcategory
            </Button>
          </div>
          <Table
            dataSource={subcategoriesList.map((subcategory) => ({
              subcategory,
            }))}
            columns={columns}
            loading={loading}
            rowKey="subcategory"
            pagination={{ position: ["bottomCenter"] }}
          />
        </>
      ),
    },
    {
      label: "Archived Subcategories",
      key: "2",
      children: (
        <Table
          dataSource={archivedSubcategoriesList.map((subcategory) => ({
            subcategory,
          }))}
          columns={archivedColumns}
          loading={loading}
          rowKey="subcategory"
          pagination={{ position: ["bottomCenter"] }}
        />
      ),
    },
  ];

  return (
    <Flex vertical flex={1} className="content">
      <div className="intro">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="backButton"
        >
          {" "}
          Categories
        </Button>
        <h2>Category Details</h2>
      </div>
      <div className="details" style={{ marginTop: "20px" }}>
        <div className="infoContainer">
          <div className="infoTitle">
            <div className="titleContent">
              {category?.name}
                {isArchived ? <span className="archivedStatus">Archived </span> : <span className="activeStatus">Active</span>}
            </div>

            <div className="buttonContainer">
              <Button
                className="editBtn"
                onClick={() => handleEdit(category, true)}
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
      <div className="detailsTable">
        <Tabs defaultActiveKey="1" className="table" items={tabItems} />
      </div>
      <Modal
        title={isCategoryEdit ? "Edit Category" : "Edit Subcategory"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSave}>
          <p className="formTitle">
            {isCategoryEdit ? "Category Details" : "Subcategory Details"}
          </p>
          {isCategoryEdit ? (
            <Form.Item
              name="categoryName"
              rules={[
                { required: true, message: "Please enter the category name" },
              ]}
            >
              <Input className="userInput" placeholder="Category Name" />
            </Form.Item>
          ) : (
            <Form.Item
              name="subcategoryName"
              initialValue={editingItem}
              rules={[
                {
                  required: true,
                  message: "Please enter the subcategory name",
                },
              ]}
            >
              <Input className="userInput" placeholder="Subcategory Name" />
            </Form.Item>
          )}
          <Form.Item className="concludeBtns">
            <Button
              className="editBtn"
              onClick={() => setIsModalVisible(false)}
            >
              Cancel
            </Button>
            <Button
              className="addBtn"
              type="primary"
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

export default CategoryDetails;
