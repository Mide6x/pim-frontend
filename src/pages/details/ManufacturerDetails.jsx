import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, Table, message, Input, Button, Form, Modal } from "antd";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { ArrowLeftOutlined } from "@ant-design/icons";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";

const ManufacturerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [manufacturer, setManufacturer] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddBrandModalVisible, setIsAddBrandModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [addBrandForm] = Form.useForm();
  const [isArchived, setIsArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingManufacturer, setIsEditingManufacturer] = useState(false);
  const [brandsList, setBrandsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchManufacturerDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/v1/manufacturer/${id}`);
        setManufacturer(response.data);
        setIsArchived(response.data.isArchived);
        setBrandsList(response.data.brands);
      } catch (error) {
        message.error("Failed to fetch manufacturer details 😔");
      } finally {
        setLoading(false);
      }
    };

    fetchManufacturerDetails();
  }, [id]);

  const handleEdit = (brand, isManufacturer = false) => {
    if (isManufacturer) {
      setIsEditingManufacturer(true);
      form.setFieldsValue({ manufacturerName: manufacturer?.name });
    } else {
      setIsEditingManufacturer(false);
      setEditingBrand(brand);
      form.setFieldsValue({ brandName: brand });
    }
    setIsModalVisible(true);
  };
  const handleArchive = async () => {
    try {
      await axios.patch(`/api/v1/manufacturer/${id}/archive`);
      setIsArchived(true);
      message.success("Manufacturer archived successfully 🎉");
    } catch (error) {
      message.error("Failed to archive manufacturer 😔");
    }
  };

  const handleUnarchive = async () => {
    try {
      await axios.patch(
        `/api/v1/manufacturer/${id}/unarchive`
      );
      setIsArchived(false);
      message.success("Manufacturer unarchived successfully 🎉");
    } catch (error) {
      message.error("Failed to unarchive manufacturer 😔");
    }
  };
  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();

      if (isEditingManufacturer) {
        await axios.put(`/api/v1/manufacturer/${id}`, {
          ...manufacturer,
          name: values.manufacturerName,
        });
        setManufacturer((prev) => ({ ...prev, name: values.manufacturerName }));
        message.success("Manufacturer details updated successfully! 🎉");
      } else {
        const updatedBrands = manufacturer.brands.map((brand) =>
          brand === editingBrand ? values.brandName : brand
        );
        await axios.put(`/api/v1/manufacturer/${id}`, {
          ...manufacturer,
          brands: updatedBrands,
        });
        setManufacturer((prev) => ({ ...prev, brands: updatedBrands }));
        setBrandsList(updatedBrands);
        message.success("Brand updated successfully! 🎉");
      }

      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to update details 😔");
    }
  };

  const handleCreateNewBrand = async (values) => {
    try {
      const newBrands = values.newBrandName.split(",").map((brand) => brand.trim());
      const updatedBrands = [...manufacturer.brands, ...newBrands];

      await axios.put(`/api/v1/manufacturer/${id}`, {
        ...manufacturer,
        brands: updatedBrands,
      });

      setManufacturer((prev) => ({ ...prev, brands: updatedBrands }));
      setBrandsList(updatedBrands);
      message.success("New Brand added successfully! 🎉");
      setIsAddBrandModalVisible(false);
      addBrandForm.resetFields();
    } catch (error) {
      message.error("Failed to add new brand 😔");
    }
  };

  const handleSearch = (value) => {
    if (value.length >= 3) {
      const filteredBrands = manufacturer.brands.filter((brand) =>
        brand.toLowerCase().includes(value.toLowerCase())
      );
      setBrandsList(filteredBrands);
    } else {
      setBrandsList(manufacturer.brands);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/v1/manufacturer/${id}`);
      message.success("Manufacturer deleted successfully 🎉");
      navigate("/manufacturers");
    } catch (error) {
      message.error("Failed to delete manufacturer 😔");
    }
  };

  const handleSpeechResult = (transcript) => {
    setSearchTerm(transcript);
    handleSearch(transcript);
  };

  const handleMicClick = useSpeechRecognition(handleSpeechResult);

  const columns = [
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      className: "nameListing",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button className="editBtn" onClick={() => handleEdit(record.brand)}>
          <FontAwesomeIcon icon={faPenToSquare} /> Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="intro">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="backButton"
        >
          Manufacturers
        </Button>
        <h2>Manufacturer Details</h2>
      </div>
      <div className="details">
        <div className="infoContainer">
          <div className="infoTitle">
            <div className="titleContent">
              {manufacturer?.name}
              
                {isArchived ? <span className="archivedStatus">Archived </span> : <span className="activeStatus">Active</span>}
             
            </div>

            <div className="buttonContainer">
              <Button
                className="editBtn"
                onClick={() => handleEdit(manufacturer, true)}
              >
                <FontAwesomeIcon icon={faPenToSquare} /> Edit Details
              </Button>
              {isArchived ? (
                <Button
                  className="unarchiveBtn"
                  onClick={() => handleUnarchive()}
                  style={{ marginLeft: "10px" }}
                >
                  Unarchive
                </Button>
              ) : (
                <Button
                  className="archiveBtn"
                  onClick={() => handleArchive()}
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
        <Tabs
          defaultActiveKey="1"
          className="table"
          items={[
            {
              label: "Brands",
              key: "1",
              children: (
                <div>
                  <div className="searchBarContainer">
                    <div className="searchBarWrapper" style={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Input
                        placeholder="Search Brands by name"
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
                      className="addBtn"
                      onClick={() => setIsAddBrandModalVisible(true)}
                    >
                      Add New Brand
                    </Button>
                  </div>

                  <Table
                    dataSource={brandsList.map((brand) => ({ brand }))}
                    columns={columns}
                    loading={loading}
                    rowKey="brand"
                    pagination={{ position: ["bottomCenter"] }}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Add New Brand Modal */}
      <Modal
        title="Add New Brand"
        open={isAddBrandModalVisible}
        onCancel={() => setIsAddBrandModalVisible(false)}
        footer={null}
      >
        <Form form={addBrandForm} onFinish={handleCreateNewBrand}>
          <Form.Item
            name="newBrandName"
            rules={[{ required: true, message: "Please enter the new brand name" }]}
          >
            <Input placeholder="Enter new brand name(s) separated by commas" />
          </Form.Item>
          <Form.Item className="concludeBtns">
            <Button  className="deleteBtn" onClick={() => setIsAddBrandModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary"  className="addBtn" htmlType="submit" style={{ marginLeft: "10px" }}>
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={isEditingManufacturer ? "Edit Manufacturer" : "Edit Brand"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSave}>
          <p className="formTitle">
            {isEditingManufacturer ? "Manufacturer Details" : "Brand Details"}
          </p>
          <Form.Item
            name={isEditingManufacturer ? "manufacturerName" : "brandName"}
            rules={[
              {
                required: true,
                message: `Please enter the ${
                  isEditingManufacturer ? "manufacturer" : "brand"
                } name`,
              },
            ]}
          >
            <Input
              placeholder={`Enter ${isEditingManufacturer ? "manufacturer" : "brand"} name`}
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
    </div>
  );
};

export default ManufacturerDetails;
