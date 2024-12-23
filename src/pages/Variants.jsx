import { useState, useEffect, useCallback } from "react";
import { Button, Table, Modal, Flex, message, Space, Upload } from "antd";
import axios from "axios";
import VariantForm from "./forms/VariantsForm";
import useAuth from "../contexts/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/free-solid-svg-icons";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const useVariants = (userId, setLoading) => {
  const [variants, setVariants] = useState([]);

  const fetchVariants = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/variants");
      const data = response?.data?.data;

      if (Array.isArray(data)) {
        setVariants(data);
      } else {
        throw new Error("Unexpected data format");
      }
    } catch (error) {
      message.error("Failed to fetch variants 😔");
      console.error("Error fetching variants:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, setLoading]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  return { variants, fetchVariants };
};

const handleApiRequest = async (requestType, url, payload = null) => {
  try {
    const response =
      requestType === "delete"
        ? await axios.delete(url)
        : await axios[requestType](url, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

const ManageVariants = () => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const { variants, fetchVariants } = useVariants(userData?._id, setLoading);

  const createdBy = userData?.email || userData?._id || null;
  if (!createdBy) {
    throw new Error("User data is missing, and 'createdBy' cannot be set.");
  }

  const handleModalOpen = (variant = null) => {
    setEditingVariant(variant);
    setIsModalVisible(true);
  };

  const handleSaveVariant = async (values) => {
    const url = editingVariant
      ? `/api/v1/variants/${editingVariant._id}`
      : "/api/v1/variants";
    const requestType = editingVariant ? "put" : "post";
    const payload = { ...values, createdBy };
  
    try {
      await handleApiRequest(requestType, url, payload);
      message.success(
        editingVariant ? "Variant updated 🎉" : "Variant created 🎉"
      );
      fetchVariants();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to save variant 😔");
      // More detailed logging of the error object
      console.error("Error saving variant:", error.response || error.message || error);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await handleApiRequest("delete", `/api/v1/variants/${id}`);
      message.success("Variant deleted successfully 🎉");
      fetchVariants();
    } catch (error) {
      message.error("Failed to delete variant 😔");
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
        const variantsToSave = parsedData.map((item) => ({
          name: item["Variants"],
          brands: item["Attributes"]
            ? item["Attributes"].split(",").map((brand) => brand.trim())
            : [],
        }));
        await handleSaveVariant(variantsToSave);
        fetchVariants();
      } catch (error) {
        message.error("Failed to process the Excel file. 😔");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("/BulkUploadVariants.xlsx");
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      saveAs(blob, "BulkUploadVariants.xlsx");
    } catch (error) {
      message.error(`Failed to download template: ${error.message} 😔`);
    }
  };

  const columns = [
    {
      title: "Variant",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Attributes",
      dataIndex: "subvariants",
      key: "subVariants",
      render: (subVariants) =>
        Array.isArray(subVariants)
          ? subVariants.map((variant) => variant.name).join(", ")
          : "No sub-variants",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button className="editBtn" onClick={() => handleModalOpen(record)}>Edit</Button>
          <Button className="deleteBtn" onClick={() => handleDelete(record._id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <Flex vertical flex={1} className="content">
      <div className="intro">
        <h2>Manage Variants</h2>
        <p className="aboutPage" style={{ marginBottom: "10px" }}>
          Create custom variants to provide more product information
        </p>
        <div className="searchBarContainer">
          <Button className="addBtn" onClick={handleDownload}>
            Download Template
          </Button>
          <Upload beforeUpload={() => false} onChange={handleUpload}>
            <Button className="archiveBtn">
              <FontAwesomeIcon
                size="lg"
                style={{ color: "#008162" }}
                icon={faFileArrowUp}
              />{" "}
              Bulk Upload
            </Button>
          </Upload>
          <Button
            type="primary"
            className="addBtn"
            onClick={() => handleModalOpen()}
          >
            Add Single Variant
          </Button>
        </div>
      </div>
      <div className="details">
        <Table
          columns={columns}
          dataSource={variants}
          loading={loading}
          rowKey="_id"
          className="table"
          pagination={{ position: ["bottomCenter"] }}
        />
        <Modal
          title={editingVariant ? "Edit Variant" : "Create Variant"}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <VariantForm
            initialValues={editingVariant}
            onCancel={() => setIsModalVisible(false)}
            onOk={handleSaveVariant}
          />
        </Modal>
      </div>
    </Flex>
  );
};

export default ManageVariants;
