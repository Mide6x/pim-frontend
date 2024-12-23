import { Form, Upload, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import PropTypes from "prop-types";
import { useState } from "react";

const ImageUploadSection = ({ setImageUrl, initialImageUrl }) => {
  const [previewImage, setPreviewImage] = useState(initialImageUrl);

  const uploadProps = {
    accept: ".jpg,.jpeg,.png",
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("You can only upload JPG/PNG file!");
      }
      return isJpgOrPng || Upload.LIST_IGNORE;
    },
    maxCount: 1,
    showUploadList: false,
  };

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("/api/v1/processedproductformimages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        const imageUrl = String(response.data.imageUrl);
        setImageUrl(imageUrl);
        setPreviewImage(imageUrl);
        message.success("Image uploaded successfully!");
      }
    } catch (error) {
      message.error("An error occurred while uploading the image.");
    }
  };

  return (
    <>
      <p className="formTitle">Product Image</p>
      <Form.Item
        name="imageUrl"
        rules={[{ required: true, message: "Please upload a product image" }]}
      >
        <div className="image-upload-container">
          <Upload
            {...uploadProps}
            customRequest={handleUpload}
            className="upload-area"
          >
            {previewImage ? (
              <div className="image-preview">
                <img src={previewImage} alt="Product" />
                <div className="upload-overlay">
                  <FontAwesomeIcon
                    icon={faCloudArrowUp}
                    size="2xl"
                    style={{ color: "#069f7e" }}
                  />
                  <span>Change Image</span>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <FontAwesomeIcon
                  icon={faCloudArrowUp}
                  size="2xl"
                  style={{ color: "#069f7e" }}
                />
                <span>Upload Image</span>
                <span className="upload-hint">Supported: JPG, JPEG, PNG</span>
              </div>
            )}
          </Upload>
        </div>
      </Form.Item>
    </>
  );
};

ImageUploadSection.propTypes = {
  setImageUrl: PropTypes.func.isRequired,
  initialImageUrl: PropTypes.string,
};

export default ImageUploadSection;
