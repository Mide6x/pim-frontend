import { useState } from "react";
import { Flex, Button, message, Upload, Table, Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import axios from "axios";
import { saveAs } from "file-saver";
import { Link } from "react-router-dom";

const { TabPane } = Tabs;

const Images = () => {
  const [data, setData] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  const handleUpload = (info) => {
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
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      try {
        const wb = XLSX.read(arrayBuffer, { type: "array" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const parsedData = XLSX.utils.sheet_to_json(ws);

        const hasEmptyVariants = parsedData.some((item) => !item["Variant"]);
        if (hasEmptyVariants) {
          message.error(
            "Some rows have empty Variant values. Please check your file. 🤔"
          );
          return;
        }
        console.log("Parsed data:", parsedData);
        setData(parsedData);
      } catch (error) {
        message.error(
          "Failed to read the file. Ensure it is a valid Excel file. 😔"
        );
        console.error("Error reading file:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("/FinalUpload.xlsx");
      if (!response.ok) throw new Error("File not found");

      const blob = await response.blob();
      saveAs(blob, "FinalUpload.xlsx");
    } catch (error) {
      message.error(`Failed to download template: ${error.message} 😔`);
    }
  };

  const processImages = async () => {
    setLoading(true);
    try {
      await axios.post("/api/v1/images/process", {
        images: processedData,
      });
      const response = await axios.get(
        "/api/v1/processedimages"
      );
      console.log("Fetched processed images:", response.data);
      setProcessedImages(response.data);
      message.success("Images processed successfully 🎉");
      setActiveTab("2");
    } catch (error) {
      console.error("Error processing images:", error);
      message.error(`Error processing images: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const convertVariantFormat = (variant) => {
    variant = String(variant);
    variant = variant.replace(/\s*[xX×]\s*/g, "x").replace("ltr", "L");
    const pattern1 = /(\d+)\s*([a-zA-Z]+)\s*x\s*(\d+)/i;
    const pattern2 = /(\d+)\s*x\s*(\d+)\s*([a-zA-Z]+)/i;
    const pattern3 = /(\d+)x(\d+)([a-zA-Z]+)/i;
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
    return variant;
  };

  const extractAmount = (weightStr) => {
    try {
      let amount_start = weightStr.indexOf("x");
      if (amount_start === -1) amount_start = weightStr.indexOf("×");
      if (amount_start === -1) amount_start = weightStr.indexOf("X");
      if (amount_start === -1) return null;
      return parseInt(weightStr.slice(amount_start + 1).trim(), 10);
    } catch {
      return null;
    }
  };

  const processedData = data.map((item) => {
    const formattedVariant = convertVariantFormat(item["Variant"]);
    const amount = extractAmount(formattedVariant);
    return {
      ...item,
      Variant: formattedVariant,
      Amount: amount,
    };
  });

  const columns = [
    {
      title: "Product Name",
      dataIndex: "Product Name",
      key: "product_name",
    },
    {
      title: "Manufacturer Name",
      dataIndex: "Manufacturer Name",
      key: "manufacturer_name",
    },
    {
      title: "Product Category",
      dataIndex: "Product Category",
      key: "product_category",
    },
    {
      title: "Product Subcategory",
      dataIndex: "Product Subcategory",
      key: "product_subcategory",
    },
    {
      title: "Variant",
      dataIndex: "Variant",
      key: "variant",
    },
    {
      title: "Variant Type",
      dataIndex: "Variant Type",
      key: "variant_type",
    },
    {
      title: "Quantity",
      dataIndex: "Amount",
      key: "amount",
    },
    {
      title: "Weight (Kg)",
      dataIndex: "Weight (in Kg)",
      key: "weight_in_kg",
    },
    {
      title: "Image URL",
      dataIndex: "Image URL",
      key: "image_url",
    },
  ];

  const processedColumns = [
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
      dataIndex: "weight",
      key: "weight_in_kg",
    },
    {
      title: "Image URL",
      dataIndex: "imageUrl",
      key: "imageUrl",
    },
  ];

  return (
    <Flex vertical flex={1} className="content">
      <div>
        <div className="intro">
          <h2>Image Conversion</h2>
          <p className="aboutPage" style={{ marginBottom: "10px" }}>
            Download the template and insert your data so that we begin! Most
            processes are AI-assisted but ensure a level of data accuracy, and
            verify results before moving on to the next step.
          </p>
          <div className="searchBarContainer">
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
              <Button type="primary" className="editBtn">
                <FontAwesomeIcon
                  icon={faFileArrowUp}
                  size="lg"
                  style={{ color: "#008162" }}
                />
                Click to Upload
              </Button>
            </Upload>
          </div>
        </div>

        <div className="details">
          <span style={{ margin: "0 8px", marginTop: "60px" }} />
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            className="table"
          >
            <TabPane tab="Uploaded Sheet" key="1">
              <Table
                columns={columns}
                dataSource={processedData}
                rowKey={(record) => record["Product Name"] || record.index}
                pagination={{ position: ["bottomCenter"] }}
              />

              <span style={{ margin: "0 8px" }} />
              <Button
                type="primary"
                className="spaced editBtn"
                onClick={processImages}
                style={{ marginTop: "20px" }}
                loading={loading}
                disabled={loading || !data.length}
              >
                Process Data
              </Button>
            </TabPane>
            <TabPane tab="Processed Images" key="2">
              <Table
                columns={processedColumns}
                dataSource={processedImages}
                rowKey={(record) => record["Product Name"] || record.index}
                className="spaced"
                pagination={{ position: ["bottomCenter"] }}
              />
              <Link to="/uploadtab">
                {" "}
                <Button
                  type="primary"
                  className="spaced editBtn"
                    style={{ marginTop: "20px" }}
                  disabled={processedImages.length === 0}
                >
                  Next
                </Button>
              </Link>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </Flex>
  );
};

export default Images;
