import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Sidebar.css";
import PropTypes from "prop-types";

const API_URL = "/api/v1/notifications/";

const NotificationSidebar = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(API_URL);
        setNotifications(response.data.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = useCallback((id) => {
    axios.patch(`${API_URL}${id}/read`)
      .then(() => {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === id
              ? { ...notification, read: true }
              : notification
          )
        );
      })
      .catch((error) => {
        console.error("Error marking notification as read:", error);
      });
  }, []);

  const handleNotificationDelete = useCallback((id) => {
    axios.delete(`${API_URL}${id}`)
      .then(() => {
        setNotifications((prev) =>
          prev.filter((notification) => notification._id !== id)
        );
      })
      .catch((error) => {
        console.error("Error deleting notification:", error);
      });
  }, []);

  const renderNotifications = () => {
    if (loading) return <p>Loading notifications...</p>;
    if (error) return <p>{error}</p>;
    if (notifications.length === 0) return <p>No notifications</p>;

    return notifications.map((notification) => (
      <div
        key={notification._id}
        className={`notificationItem ${notification.read ? "read" : "unread"}`}
        onClick={() => handleNotificationClick(notification._id)}
      >
        {notification.message}
        <button
          className="deleteButton"
          onClick={(e) => {
            e.stopPropagation();
            handleNotificationDelete(notification._id);
          }}
        >
          🗑️
        </button>
      </div>
    ));
  };

  return (
    <div className="notificationSidebar">
      <button className="closeButton" onClick={onClose}>
        ✖
      </button>
      <div className="notificationContent">
        {renderNotifications()}
      </div>
    </div>
  );
};

NotificationSidebar.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default NotificationSidebar;
