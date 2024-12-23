import { Alert, Button, Card, Flex, Form, Input, Spin, Typography } from "antd";
import { Link } from "react-router-dom";
import registerImage from "../assets/login.png";
import useSignUp from "../hooks/useSignup";
import "./authbody.css";

const Register = () => {
  const { loading, error, registerUser } = useSignUp();

  const handleRegister = (values) => {
    registerUser(values);
  };

  return (
    <div className="authbody">
      <Card className="form-container">
        <Flex gap="large" align="center">
          <Flex vertical flex={1}>
            <Typography.Title level={3} strong className="title">
              Welcome Pookie, let&apos;s create an account for you! 🎉
            </Typography.Title>
            <Typography.Text type="secondary" strong className="slogan">
              if you&apos;re here, I assume you work in Sabi.
            </Typography.Text>
            <Form
              layout="vertical"
              onFinish={handleRegister}
              autoComplete="off"
            >
              <Form.Item
                label="Full Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Kindly Input Your Full Name 👉👈",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter your full name"
                  className="userInput"
                />
              </Form.Item>
              <Form.Item
                label="Sabi E-mail Address"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "We'll need your E-mail address Pookie 👉👈",
                  },
                  {
                    type: "email",
                    message:
                      "That input does not look like an E-mail sorry, let's do that again?",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="...and your E-mail"
                  className="userInput"
                />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "We kinda need a Password to continue 🫢",
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Give us a Strong Password? 🥷🏿"
                  className="userInput"
                />
              </Form.Item>
              <Form.Item
                label="Password Confirm"
                name="passwordConfirm"
                rules={[
                  {
                    required: true,
                    message: "Type in your password again.",
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Type your password again."
                  className="userInput"
                />
              </Form.Item>

              {error && (
                <Alert
                  description={error}
                  type="error"
                  showIcon
                  closable
                  className="alert"
                />
              )}
              <div style={{ marginTop: 8 }}></div>
              <Form.Item>
                <Button
                  type={loading ? "" : "primary"}
                  htmlType="submit"
                  size="large"
                  className="btn addBtn"
                >
                  {loading ? <Spin className="spinner" /> : "Create Account"}
                </Button>
              </Form.Item>
              <Form.Item>
                <Link to="/login">
                  <Button size="large" className="btn editBtn">
                    Sign In
                  </Button>
                </Link>
              </Form.Item>
            </Form>
          </Flex>
          <Flex flex={1} className="auth-img-wrapper">
            <img src={registerImage} className="auth-img" alt="Register" />
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};

export default Register;
