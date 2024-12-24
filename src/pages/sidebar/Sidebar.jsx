import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { Menu, Button } from "antd";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faImage,
  faFileCircleCheck,
  faIndustry,
  faCartShopping,
  faChartSimple,
  faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../contexts/useAuth";
import "./Sidebar.css";
import logoImage from "../../assets/logo.png";

const getIcon = (icon) => (
  <FontAwesomeIcon 
    icon={icon} 
    size="lg" 
    style={{ 
      color: "#ffffff",
      width: "18px",
      height: "18px",
      opacity: 0.9 
    }} 
  />
);

const menuItems = [
  {
    type: 'group',
    label: 'Overview',
    key: 'overview',
    children: [
      {
        key: '1',
        label: <Link to="/dashboard">Dashboard</Link>,
        icon: getIcon(faChartSimple),
      },
    ],
  },
  {
    type: 'group',
    label: 'Product Cleaning',
    key: 'product-cleaning',
    children: [
      {
        key: '2',
        label: <Link to="/images">Image Conversion</Link>,
        icon: getIcon(faImage),
      },
      {
        key: '3',
        label: <Link to="/uploadtab">Data Cleaning</Link>,
        icon: getIcon(faDatabase),
      },
      {
        key: '4',
        label: <Link to="/approval">Approve Products</Link>,
        icon: getIcon(faFileCircleCheck),
      },
    ],
  },
  {
    type: 'group',
    label: 'PIM Settings',
    key: 'pim-settings',
    children: [
      {
        key: '5',
        label: <Link to="/mngmanufacturers">Manage Manufacturers</Link>,
        icon: getIcon(faIndustry),
      },
      {
        key: '6',
        label: <Link to="/categories">Manage Categories</Link>,
        icon: getIcon(faCartShopping),
      },
      {
        key: '7',
        label: <Link to="/variants">Variant Types</Link>,
        icon: getIcon(faScaleBalanced),
      },
    ],
  },
];

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [currentKey, setCurrentKey] = useState("");

  useEffect(() => {
    const activeItem = menuItems.flatMap(section => section.children).find((item) => {
      const linkElement = item?.label?.props;
      return linkElement?.to === location.pathname;
    });
    setCurrentKey(activeItem ? activeItem.key : "");
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <>
      <div className={`barbody ${isMobileMenuOpen ? 'show' : ''}`}>
        <div className="sidebar-header">
          <Header logoImage={logoImage}>
            <div style={{ backgroundColor: "#000", padding: "2px 8px", borderRadius: "4px", marginLeft: "8px", display: "inline-block" }}>
              <span style={{ color: "#fff", fontWeight: "bold" }}>AI</span>
            </div>
          </Header>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[currentKey]}
          items={menuItems}
          style={{ 
            marginTop: "20px", 
            fontSize: "15px", 
            backgroundColor: "#212B36",
            color: "#ffffff" 
          }}
          onClick={() => {
            // Close mobile menu after a slight delay to allow link navigation
            setTimeout(() => {
              setIsMobileMenuOpen(false);
            }, 150);
          }}
        />

        <LogoutSection handleLogout={handleLogout} />
      </div>
      <div 
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'show' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};

const Header = ({ logoImage }) => (
  <div className="header">
    <div className="image">
      <img src={logoImage} className="logo-img" alt="Logo" />
      <div className="ai-badge">
        <span>AI</span>
      </div>
    </div>
  </div>
);

Header.propTypes = {
  logoImage: PropTypes.string.isRequired,
};

const LogoutSection = React.memo(({ handleLogout }) => (
  <div className="logout-container">
    <div className="logoutContainer0">
      <span>Sabi</span>
    </div>
    <div className="logoutContainer1">
      <Button onClick={handleLogout} danger className="logout-button">
        Log Out
      </Button>
    </div>
  </div>
));

LogoutSection.propTypes = {
  handleLogout: PropTypes.func.isRequired,
};

LogoutSection.displayName = "LogoutSection";  

Sidebar.propTypes = {
  isMobileMenuOpen: PropTypes.bool.isRequired,
  setIsMobileMenuOpen: PropTypes.func.isRequired
};

export default Sidebar;
