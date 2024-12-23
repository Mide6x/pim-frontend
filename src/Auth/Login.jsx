import { Alert, Button, Card, Form, Input, Spin, Typography } from "antd";
import { Link } from "react-router-dom";
import loginImage from "../assets/login.png";
import useLogin from "../hooks/useLogin";
import "./authbody.css";

const Login = () => {
  const { loading, error, loginUser } = useLogin();

  const handleLogin = async (values) => {
    await loginUser(values);
  };

  return (
    <div className="authbody">
      <Card className="form-container">
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div style={{ flex: 1 }} className="auth-img-wrapper">
            <img src={loginImage} className="auth-img" alt="Login" />
          </div>
          <div style={{ flex: 1 }}>
            <Typography.Title level={3} strong className="title">
              Let&apos;s get you logged in! 😤
            </Typography.Title>
            <Typography.Text type="secondary" strong className="slogan">
              If you&apos;re here, I assume you work at Sabi.
            </Typography.Text>
            <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
              <Form.Item
                label="Sabi E-mail Address"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "We'll need your E-mail address, Pookie 👉👈",
                  },
                  {
                    type: "email",
                    message:
                      "That input does not look like an E-mail. Let's try that again?",
                  },
                ]}
              >
                <Input size="large" placeholder="...and your E-mail"   className="userInput"/>
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "We kinda need a password to continue 🫢",
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Give us a strong password? 🥷🏿"
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
                  type={loading ? "default" : "primary"}
                  htmlType="submit"
                  size="large"
                  className="btn addBtn"
                >
                  {loading ? <Spin  className="spinner" /> : "Sign In"}
                </Button>
              </Form.Item>
              <Form.Item>
                <Link to="/">
                  <Button size="large" className="btn editBtn">
                    Create Account
                  </Button>
                </Link>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
