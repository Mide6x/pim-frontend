import { Upload, Form, Button, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import PropTypes from "prop-types";

const ImageUploadSection = ({ setImageUrl }) => {
  const uploadProps = {
    accept: ".jpg,.jpeg,.png",
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("You can only upload JPG/PNG file!");
      }
      return isJpgOrPng || Upload.LIST_IGNORE;
    },
    maxCount: 1,
  };

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("image", file);
  
    try {
      const response = await axios.post("/api/v1/processedproductformimages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        const imageUrl = String(response.data.imageUrl);
        setImageUrl(imageUrl);
        message.success("Image uploaded successfully!");
        console.log("Image uploaded successfully:", response.data);
        console.log("Image URL:", imageUrl);
      } else {
        message.error("Failed to upload image.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("An error occurred while uploading the image.");
    }
  };
  

  return (
    <>
      <p className="formTitle">Product Image</p>
      <Form.Item
        name="imageUrl"
        rules={[{ required: true }]}
        className="imgUpload"
      >
        <Upload
          {...uploadProps}
          listType="picture"
          customRequest={handleUpload}
        >
          <Button className="imgbtn">
            <FontAwesomeIcon
              icon={faCloudArrowUp}
              size="2xl"
              style={{ color: "#069f7e" }}
            />
            Upload Image
          </Button>
        </Upload>
        <span>Supported file formats: JPG, JPEG, and PNG</span>
      </Form.Item>
        
    </>
  );
};

// Define PropTypes
ImageUploadSection.propTypes = {
  setImageUrl: PropTypes.func.isRequired,
};

export default ImageUploadSection;
