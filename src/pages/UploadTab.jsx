import { useState, useEffect } from "react";
import { Flex, Button, message, Table, Modal, Form } from "antd";
import axios from "axios";
import { categorizeProductWithOpenAI } from "../hooks/openaiCategorizer";
import useAuth from "../contexts/useAuth";
import { useNavigate } from "react-router-dom";

const UploadTab = () => {
  const { userData } = useAuth();
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("processedData");
    return savedData ? JSON.parse(savedData) : [];
  });
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("processedData", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (userData && userData._id) {
      const fetchData = async () => {
        try {
          const response = await axios.get("/api/v1/processedimages");
          setData(response.data);
        } catch (error) {
          message.error("Failed to fetch data 😔");
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [userData]);

  const extractSize = (weightStr) => {
    try {
      const pattern = /(\d+\.?\d*)(KG|G|ML|L|CL)/i;
      const match = weightStr.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        if (unit === "KG") return value * 1000;
        if (unit === "G") return value;
        if (unit === "ML") return value;
        if (unit === "L") return value * 1000;
        if (unit === "CL") return value * 10;
      }
      return null;
    } catch {
      return null;
    }
  };

  const convertVariantFormat = (variant) => {
    variant = String(variant);
    variant = variant.replace(/\s*[xX×]\s*/g, "x").replace("ltr", "L");

    const pattern1 = /(\d+)\s*([a-zA-Z]+)\s*x\s*(\d+)/i;
    const pattern2 = /(\d+)\s*x\s*(\d+)\s*([a-zA-Z]+)/i;
    const pattern3 = /(\d+)x(\d+)([a-zA-Z]+)/i;

    const nonMultiplicativePattern1 = /(\d+)\s*([a-zA-Z]+)/i;

    const match1 = variant.match(pattern1);
    if (match1) {
      const [, size, unit, count] = match1;
      return `${size.toUpperCase()}${unit.toUpperCase()} x ${count}`;
    }

    const match2 = variant.match(pattern2);
    if (match2) {
      const [, count, size, unit] = match2;
      return `${size.toUpperCase()}${unit.toUpperCase()} x ${count}`;
    }

    const match3 = variant.match(pattern3);
    if (match3) {
      const [, count, size, unit] = match3;
      return `${size.toUpperCase()}${unit.toUpperCase()} x ${count}`;
    }

    // Check for non-multiplicative formats
    const nonMultiplicativeMatch1 = variant.match(nonMultiplicativePattern1);
    if (nonMultiplicativeMatch1) {
      const [, size, unit] = nonMultiplicativeMatch1;
      return `${size.toUpperCase()}${unit.toUpperCase()}`;
    }
    return variant;
  };

  const extractAmount = (weightStr) => {
    try {
      let amount_start = weightStr.indexOf("x");
      if (amount_start === -1) amount_start = weightStr.indexOf("×");
      if (amount_start === -1) amount_start = weightStr.indexOf("X");
      if (amount_start === -1) return 1;
      return parseInt(weightStr.slice(amount_start + 1).trim(), 10);
    } catch {
      return 1;
    }
  };

  const categorizeProduct = async (productName) => {
    try {
      const result = await categorizeProductWithOpenAI(productName);
      return result;
    } catch (error) {
      message.error("Failed to categorize product 😔");
      console.error("Error categorizing product:", error);
      return { productCategory: "Unknown", productSubcategory: "Unknown" };
    }
  };

  const cleanData = async (df) => {
    console.log("User Data:", userData);
    return await Promise.all(
      df.map(async (row) => {
        const variant = convertVariantFormat(row.variant);
        const weight = extractSize(variant);
        const amount = extractAmount(variant);
        const weightInKg = weight && amount ? (weight * amount) / 1000 : 1;

        const { productCategory, productSubcategory } = await categorizeProduct(
          row.productName
        );

        const createdBy =
          userData && userData.email
            ? String(userData.email)
            : userData && userData._id
            ? String(userData._id)
            : null;

        if (!createdBy) {
          throw new Error(
            "User data is missing, and 'createdBy' cannot be set."
          );
        }

        return {
          ...row,
          productCategory: productCategory,
          productSubcategory: productSubcategory,
          variant: variant,
          variantType: "Size",
          amount: amount || 1,
          weightInKg: weightInKg ? Math.round(weightInKg) : 1,
          createdBy: createdBy,
        };
      })
    );
  };

  const handleProcess = async () => {
    setLoading(true);
    try {
      const cleanedData = await cleanData(data);
      setData(cleanedData);
      message.success("Data processing completed.");
    } catch (error) {
      message.error("Failed to process data 😔");
      console.error("Error processing data:", error);
    }
    setLoading(false);
  };

  const handlePushToApproval = async () => {
    try {
      console.log("Data being sent:", data);
      await axios.post("/api/v1/approvals", data);
      message.success("Data successfully sent for approval.");
      await deleteProcessedImages(getImageIdsFromData(data));
      localStorage.removeItem("processedData");

      setData([]);
      navigate('/approval');
    } catch (error) {
      console.error(
        "Error sending data for approval or deleting processed images:",
        error
      );
      message.error(
        "Failed to send data for approval or delete processed images."
      );
    }
  };

  const getImageIdsFromData = (data) => {
    return data.map((item) => item._id);
  };

  const deleteProcessedImages = async (imageIds) => {
    try {
      await axios.delete("/api/v1/processedimages/deleteProcessedImages", {
        data: { imageIds },
      });
    } catch (error) {
      console.error("Error deleting processed images:", error);
    }
  };

  const handleModalOk = async () => {
    setIsModalVisible(false);
    await handlePushToApproval();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleConfirm = () => {
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "product_name",
    },
    {
      title: "Manufacturer Name",
      dataIndex: "manufacturerName",
      key: "manufacturer_name",
    },
    {
      title: "Product Category",
      dataIndex: "productCategory",
      key: "product_category",
    },
    {
      title: "Product Subcategory",
      dataIndex: "productSubcategory",
      key: "product_subcategory",
    },
    {
      title: "Variant",
      dataIndex: "variant",
      key: "variant",
    },
    {
      title: "Variant Type",
      dataIndex: "variantType",
      key: "variant_type",
    },
    {
      title: "Quantity",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Weight (Kg)",
      dataIndex: "weightInKg",
      key: "weight_in_kg",
    },
    {
      title: "Image URL",
      dataIndex: "imageUrl",
      key: "image_url",
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "created_by",
    },
  ];

  return (
    <>
      {userData && (
        <Flex vertical flex={1} className="content">
          <div>
            <div className="intro">
              <h2>Data Cleaning</h2>
              <p className="aboutPage" style={{ marginTop: "10px" }}>
                Here the data is cleaned using our in-built Artificial
                Intelligence system. the Product Category, Product Subcategory,
                and other relvant details are automatically inputted.
              </p>
            </div>
            <div className="details" style={{ marginTop: "20px" }}>
              <span style={{ margin: "0 8px", marginTop: "60px" }} />
              <Table
                columns={columns}
                dataSource={data}
                rowKey={(record) => record._id}
                className="table"
                pagination={{ position: ["bottomCenter"] }}
              />
              <Button
                type="primary"
                className="spaced editBtn"
                onClick={handleProcess}
                loading={loading}
                disabled={loading || !data.length}
              >
                Process Data
              </Button>
              <span style={{ margin: "0 8px" }} />
              <Button
                type="primary"
                className="spaced addBtn"
                onClick={handleConfirm}
                disabled={!data.length}
              >
                Send to Approval
              </Button>
            </div>
            <Modal
              title="Confirm Send to Approval"
              open={isModalVisible}
              onCancel={handleModalCancel}
              okText="Confirm"
              cancelText="Cancel"
              footer={null}
            >
              <Form form={form} onFinish={handleModalOk}>
                <p>Are you sure you want to send the data for approval?</p>
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
                    Ok
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </Flex>
      )}
    </>
  );
};

export default UploadTab;
