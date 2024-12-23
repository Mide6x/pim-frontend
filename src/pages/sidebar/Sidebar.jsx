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
import { MenuOutlined } from '@ant-design/icons';

const menuItems = [
  {
    type: "section",
    label: "Overview",
    items: [
      { key: "1", label: "Dashboard", icon: faChartSimple, to: "/dashboard" },
    ]
  },
  {
    type: "section",
    label: "Product Cleaning",
    items: [
      { key: "2", label: "Image Conversion", icon: faImage, to: "/images" },
      { key: "3", label: "Data Cleaning", icon: faDatabase, to: "/uploadtab" },
      { key: "4", label: "Approve Products", icon: faFileCircleCheck, to: "/approval" },
    ]
  },
  {
    type: "section",
    label: "PIM Settings",
    items: [
      { key: "5", label: "Manage Manufacturers", icon: faIndustry, to: "/mngmanufacturers" },
      { key: "6", label: "Manage Categories", icon: faCartShopping, to: "/categories" },
      { key: "7", label: "Variant Types", icon: faScaleBalanced, to: "/variants" },
    ]
  }
];

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

const MenuItem = React.memo(function MenuItem({ item, isActive, onMobileMenuClose }) {
  const { key, label, to, icon } = item;
  return (
    <Menu.Item
      key={key}
      icon={getIcon(icon)}
      style={{ padding: "5px", color: "#ffffff", fontWeight: "450" }}
      className={isActive ? "active-menu-item" : "menuItem"}
      onClick={onMobileMenuClose}
    >
      <Link to={to}>{label}</Link>
    </Menu.Item>
  );
});

MenuItem.propTypes = {
  item: PropTypes.shape({
    key: PropTypes.string.isRequired,
    icon: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onMobileMenuClose: PropTypes.func.isRequired,
};

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [currentKey, setCurrentKey] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    closeMobileMenu();
  }, [location]);

  useEffect(() => {
    const activeItem = menuItems.flatMap(section => section.items).find((item) => item.to === location.pathname);
    setCurrentKey(activeItem ? activeItem.key : "");
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <MenuOutlined />
      </div>
      
      <div className={`barbody ${isMobileMenuOpen ? 'show' : ''}`}>
        <Header logoImage={logoImage}>
          <div style={{ backgroundColor: "#000", padding: "2px 8px", borderRadius: "4px", marginLeft: "8px", display: "inline-block" }}>
            <span style={{ color: "#fff", fontWeight: "bold" }}>AI</span>
          </div>
        </Header>

        <Menu
          mode="inline"
          selectedKeys={[currentKey]}
          style={{ marginTop: "20px", fontSize: "15px", backgroundColor: "#212B36" }}
        >
          {menuItems.map((section, index) => (
            <Menu.ItemGroup 
              key={index} 
              title={section.label}
              style={{ color: "#C0C0C0", fontWeight: "bold" }}
            >
              {section.items.map((item) => (
                <MenuItem 
                  key={item.key} 
                  item={item} 
                  isActive={item.key === currentKey}
                  onMobileMenuClose={closeMobileMenu}
                />
              ))}
            </Menu.ItemGroup>
          ))}
        </Menu>

        <LogoutSection handleLogout={handleLogout} />
      </div>
      <div 
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'show' : ''}`}
        onClick={closeMobileMenu}
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
export default Sidebar;
