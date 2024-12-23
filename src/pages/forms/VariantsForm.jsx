import PropTypes from "prop-types";
import { Button, Form, Input } from "antd";
import { useEffect } from "react";
import useAuth from "../../contexts/useAuth";

const VariantForm = ({ initialValues, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const { userData } = useAuth();

  useEffect(() => {
    if (userData && userData._id) {
      console.log("Running useEffect, initialValues:", initialValues);
      if (initialValues) {
        console.log("Setting form values from initialValues");
        const subvariants = Array.isArray(initialValues.subvariants)
          ? initialValues.subvariants.map((variant) => variant.name).join(", ")
          : "";
        form.setFieldsValue({ ...initialValues, subvariants });
      } else {
        console.log("Resetting form fields");
        form.resetFields();
      }
    }
  }, [initialValues, form, userData]);

  const onFinish = (values) => {
    values.subvariants = values.subvariants
      .split(",")
      .map((item) => ({ name: item.trim() }));
    onOk(values);
  };

  return (
    <>
      {userData && (
        <Form form={form} onFinish={onFinish}>
          <p className="formTitle">Variant Name</p>
          <Form.Item
            name="name"
            rules={[
              { required: true, message: "Please input the variant name!" },
            ]}
          >
            <Input
              className="userInput"
              placeholder="Enter variant name (e.g. Color, Size)"
            />
          </Form.Item>
          <p className="formTitle">Attributes</p>
          <Form.Item
            name="subvariants"
            rules={[
              { required: true, message: "Please input the attributes!" },
            ]}
          >
            <Input
              className="userInput"
              placeholder="Enter attributes (e.g. Red, Blue, Green)"
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={onCancel} className="editBtn">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="addBtn"
              style={{ marginLeft: "10px" }}
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
};

VariantForm.propTypes = {
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    subvariants: PropTypes.arrayOf(PropTypes.object),
  }),
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

export default VariantForm;
