import { useState, useEffect } from "react";
import useAuth from "../../contexts/useAuth";
import axios from "axios";
import "./Sidebar.css";
import NotificationSidebar from "./Notifications";
import userImage from "../../assets/user.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBars } from "@fortawesome/free-solid-svg-icons";

const fetchNotifications = async (userId, setHasNotifications) => {
  try {
    const response = await axios.get(`/api/v1/notifications/`);
    const unreadNotifications = response.data.data.some(notification => !notification.read);
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

  useEffect(() => {
    if (userData?._id) {
      fetchNotifications(userData._id, setHasNotifications);
    }
  }, [userData]);

  const handleBellClick = () => {
    setShowSidebar(true);
    setHasNotifications(false);
  };

  const toggleSidebar = () => {
    document.querySelector('.barbody')?.classList.toggle('show');
  };

  return userData ? (
    <>
      <div className="topbarContent">
        <div className="showSidebar" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} size="xl" style={{ color: "#069f7e" }} />
        </div>
        <div className="topbarContent0">
          <h3>{getGreeting()}, <span>{userData.name} 👋</span></h3>
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
