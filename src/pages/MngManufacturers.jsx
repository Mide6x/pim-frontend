import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Flex,
  Input,
  message,
  Space,
  Tabs,
  Card,
  Upload,
} from "antd";
import axios from "axios";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp, faMicrophone, faIndustry, faCheckCircle, faArchive } from "@fortawesome/free-solid-svg-icons";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { debounce } from "lodash";
import { Link } from "react-router-dom";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useAuth from "../contexts/useAuth";
const { TabPane } = Tabs;

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-GB", options).replace(",", " ");
};


const createColumns = (handleEdit, handleDelete, handleUnarchive = null) => [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text, record) => (
      <Link className="nameListing" to={`/manufacturers/${record._id}`}>
        {text}
      </Link>
    ),
  },
  {
    title: "Date Created",
    dataIndex: "updatedAt",
    key: "updatedAt",
    render: formatDate,
  },
  {
    title: "Number of Brands",
    dataIndex: "brands",
    key: "brands",
    render: (brands) => <span>{brands.length}</span>,
  },
  {
    title: "Actions",
    key: "actions",
    render: (text, record) => (
      <Space size="middle">
        <Button className="editBtn" onClick={() => handleEdit(record)}>
          Edit
        </Button>
        {handleUnarchive ? (
          <>
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
          </>
        ) : (
          <Link to={`/manufacturers/${record._id}`}>
            <Button className="archiveBtn">View Details</Button>
          </Link>
        )}
      </Space>
    ),
  },
];

const MngManufacturers = () => {
  const { userData } = useAuth();
  const [manufacturers, setManufacturers] = useState([]);
  const [archivedManufacturers, setArchivedManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchManufacturers = async (search = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        "/api/v1/manufacturer",
        { params: { search } }
      );
      const data = response.data;
      if (Array.isArray(data)) {
        setManufacturers(data.filter((m) => !m.isArchived));
        setArchivedManufacturers(data.filter((m) => m.isArchived));
      } else {
        message.error("Invalid data format received from server 🤔");
        setManufacturers([]);
        setArchivedManufacturers([]);
      }
    } catch (error) {
      message.error("Failed to fetch manufacturers 😔");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (info) => {
    const file = info.file;
    if (!file || !file.type.includes("spreadsheetml.sheet")) {
      message.error("Please upload a valid Excel file. 🤔");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const parsedData = XLSX.utils.sheet_to_json(ws);
        const manufacturersToSave = parsedData.map((item) => ({
          name: item["Manufacturer"],
          brands: item["Brands"]
            ? item["Brands"].split(",").map((brand) => brand.trim())
            : [],
        }));
        await saveManufacturers(manufacturersToSave);
        fetchManufacturers();
      } catch (error) {
        message.error("Failed to process the Excel file. 😔");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const saveManufacturers = async (manufacturersToSave) => {
    try {
      await axios.post(
        "/api/v1/manufacturer/bulk-upload",
        { manufacturers: manufacturersToSave }
      );
      message.success("Manufacturers uploaded successfully 🎉");
    } catch (error) {
      message.error("Failed to save manufacturers 😔");
    }
  };

  const handleUnarchive = async (manufacturer) => {
    try {
      await axios.patch(
        `/api/v1/manufacturer/${manufacturer._id}/unarchive`
      );
      message.success(`${manufacturer.name} has been unarchived 🎉`);
      fetchManufacturers();
    } catch (error) {
      message.error("Failed to unarchive manufacturer 😔");
    }
  };

  const handleBulkUnarchive = async () => {
    console.log("Selected rows to be approved:", selectedRows);
    setLoading(true);
    try {
      const unarchivedItems = selectedRows.map((manufacturer) => ({
        ...manufacturer,
      }));
      await Promise.all(
        unarchivedItems.map(async (manufacturer) => {
          console.log("Sending request to server for item:", manufacturer);
          await axios.patch(
            `/api/v1/manufacturer/${manufacturer._id}/unarchive`,
            manufacturer
          );
        })
      );
      message.success("Selected items unarchived successfully 🎉");
      fetchManufacturers();
    } catch (error) {
      message.error("Failed to unarchived selected items 😔");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("/BulkUploadManufacturers.xlsx");
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      saveAs(blob, "BulkUploadManufacturers.xlsx");
    } catch (error) {
      message.error(`Failed to download template: ${error.message} 😔`);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const handleEdit = (manufacturer) => {
    setEditingManufacturer(manufacturer);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/manufacturer/${id}`);
      message.success("Manufacturer deleted successfully 🎉");
      fetchManufacturers();
    } catch (error) {
      message.error("Failed to delete manufacturer 😔");
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

  const handleCreate = () => {
    setEditingManufacturer(null);
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    try {
      const url = editingManufacturer
        ? `/api/v1/manufacturer/${editingManufacturer._id}`
        : "/api/v1/manufacturer";
      const method = editingManufacturer ? "put" : "post";
      await axios[method](url, values);
      message.success(
        `Manufacturer ${
          editingManufacturer ? "updated" : "created"
        } successfully 🎉`
      );
      fetchManufacturers();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to save manufacturer 😔");
    }
  };

  const handleSearch = debounce((value) => {
    value.length >= 3 ? fetchManufacturers(value) : fetchManufacturers();
  }, 300);

  const handleSpeechResult = (transcript) => {
    setSearchTerm(transcript);
    handleSearch(transcript);
  };

  const handleMicrophoneClick = useSpeechRecognition(handleSpeechResult);
  return (
    <>
      {userData && (
        <Flex vertical flex={1} className="fullcontent">
          <div>
            <div className="intro">
              <h2>Manufacturers</h2>
              <span style={{ fontSize: "15px", color: "#878787" }}>
                {new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <div className="stats-container">
              <Card className="stats-item0">
                <div className="stats-item-content">
                  <div>
                    <FontAwesomeIcon
                      icon={faIndustry}
                      size="2xl"
                      style={{ color: "#ffffff" }}
                      className="iconContent"
                    />
                  </div>
                  <div className="text-content">
                    <p className="stats-item-header">Total Manufacturers</p>
                    <p className="stats-item-body">
                      {manufacturers.length + archivedManufacturers.length}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="stats-item1">
                <div className="stats-item-content">
                  <div>
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      size="2xl"
                      className="iconContent"
                      style={{ color: "#ffffff" }}
                    />
                  </div>
                  <div className="text-content">
                    <p className="stats-item-header">Active Manufacturers</p>
                    <p className="stats-item-body">{manufacturers.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="stats-item2">
                <div className="stats-item-content">
                  <div>
                    <FontAwesomeIcon
                      icon={faArchive}
                      className="iconContent"
                      size="2xl"
                      style={{ color: "#ffffff" }}
                    />
                  </div>
                  <div className="text-content">
                    <p className="stats-item-header">Inactive Manufacturers</p>
                    <p className="stats-item-body">{archivedManufacturers.length}</p>
                  </div>
                </div>
              </Card>
            </div>
            <div className="details">
              <div className="searchBarContainer">
                <div
                  className="searchBarWrapper"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Input
                    placeholder="Search Manufacturer"
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
                    onClick={handleMicrophoneClick}
                  />
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Button className="addBtn" onClick={handleDownload}>
                    Download Template
                  </Button>
                  <Upload beforeUpload={() => false} onChange={handleUpload}>
                    <Button className="archiveBtn">
                      <FontAwesomeIcon
                        size="lg"
                        style={{ color: "#008162" }}
                        icon={faFileArrowUp}
                      />
                      Bulk Upload
                    </Button>
                  </Upload>
                  <Button className="addBtn" onClick={handleCreate}>
                    Add Manufacturer
                  </Button>
                </div>
              </div>
              <Tabs className="table" activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Live Manufacturers" key="live">
                  <Table
                    columns={createColumns(handleEdit)}
                    dataSource={manufacturers}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ position: ["bottomCenter"] }}
                  />
                </TabPane>
                <TabPane tab="Archived Manufacturers" key="archived">
                  <Table
                    columns={createColumns(
                      handleEdit,
                      handleDelete,
                      handleUnarchive
                    )}
                    dataSource={archivedManufacturers}
                    rowSelection={rowSelection}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ position: ["bottomCenter"] }}
                  />
                  <Button
                    type="primary"
                    className="spaced archiveBtn"
                    onClick={handleBulkUnarchive}
                    style={{ marginTop: "20px" }}
                    disabled={selectedRows.length === 0}
                  >
                    Unarchive Selected
                  </Button>
                </TabPane>
              </Tabs>
            </div>
          </div>
        </Flex>
      )}
      <ManufacturerModal
        isVisible={isModalVisible}
        editingManufacturer={editingManufacturer}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleOk}
      />
    </>
  );
};

const ManufacturerModal = ({
  isVisible,
  editingManufacturer,
  onCancel,
  onOk,
}) => (
  <Modal
    title={editingManufacturer ? "Edit Manufacturer" : "Create Manufacturer"}
    open={isVisible}
    onCancel={onCancel}
    footer={null}
  >
    <Form initialValues={editingManufacturer} onFinish={onOk}>
      <Form.Item
        label="Manufacturer Name"
        name="name"
        rules={[{ required: true, message: "Please enter a name" }]}
      >
        <Input className="userInput" placeholder="Enter manufacturer name" />
      </Form.Item>
      <Form.Item label="Brands (comma separated)" name="brands">
        <Input.TextArea className="userInput" placeholder="Enter brands" />
      </Form.Item>
      <Form.Item>
        <Button  className="addBtn" type="primary" htmlType="submit">
          {editingManufacturer ? "Save" : "Create"}
        </Button>
      </Form.Item>
    </Form>
  </Modal>
);

ManufacturerModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  editingManufacturer: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

export default MngManufacturers;
