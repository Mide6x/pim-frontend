import { useState, useEffect } from "react";
import useAuth from "../../contexts/useAuth";
import axios from "axios";
import "./Sidebar.css";
import NotificationSidebar from "./Notifications";
import userImage from "../../assets/user.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell} from "@fortawesome/free-solid-svg-icons";
import { MenuOutlined } from "@ant-design/icons";

const fetchNotifications = async (userId, setHasNotifications) => {
  try {
    const response = await axios.get(`/api/v1/notifications/`);
    const unreadNotifications = response.data.some(notification => !notification.read);
    setHasNotifications(unreadNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};

const getGreeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
};

const Topbar = () => {
  const { userData } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.querySelector('.barbody')?.classList.toggle('show');
  };

  useEffect(() => {
    if (userData?._id) {
      fetchNotifications(userData._id, setHasNotifications);
    }
  }, [userData]);

  const handleBellClick = () => {
    setShowSidebar(true);
    setHasNotifications(false);
  };

  return userData ? (
    <>
      <div className="topbarContent">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MenuOutlined className="mobile-menu-toggle" onClick={toggleMobileMenu} />
          <div className="topbarContent0">
            <h3>{getGreeting()}, <span>{userData.name} 👋</span></h3>
          </div>
        </div>
        <div className="topbarContent1">
          <div className="flex1">
            <div className="bellIconWrapper">
              <FontAwesomeIcon
                icon={faBell}
                size="xl"
                className="iconContent3"
                onClick={handleBellClick}
              />
              {hasNotifications && <div className="notificationDot"></div>}
            </div>
          </div>
          <div className="flex2">
            <img src={userImage} className="logo-img2" alt="User" />
          </div>
          <div className="flex3">
            <h3><span>{userData.name}.</span></h3>
            <p style={{ fontSize: "12px", color: "#878787" }}>{userData.email}</p>
          </div>
        </div>
      </div>
      {showSidebar && <NotificationSidebar userId={userData._id} onClose={() => setShowSidebar(false)} />}
    </>
  ) : null;
};

export default Topbar;
