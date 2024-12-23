import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Sidebar.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTimes, faBrain, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useNotificationSummary } from '../../hooks/useNotificationSummary';

const API_URL = "/api/v1/notifications/";

const EmptyState = () => (
  <div className="emptyNotifications">
    <p>No notifications</p>
    <small>You&apos;re all caught up! 🎉</small>
  </div>
);

const NotificationSidebar = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isSummaryView, summary, loading: summaryLoading, toggleSummaryView } = useNotificationSummary();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(API_URL);
        setNotifications(response.data || []);
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
    axios.patch(`${API_URL}${id}/hide`)
      .then(() => {
        setNotifications((prev) =>
          prev.filter((notification) => notification._id !== id)
        );
      })
      .catch((error) => {
        console.error("Error hiding notification:", error);
      });
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderNotifications = () => {
    if (loading) return <div className="emptyNotifications"><p>Loading notifications...</p></div>;
    if (error) return <div className="emptyNotifications"><p>{error}</p></div>;
    if (notifications.length === 0) return <EmptyState />;

    return notifications.map((notification) => (
      <div
        key={notification._id}
        className={`notificationItem ${notification.read ? "read" : "unread"}`}
        onClick={() => handleNotificationClick(notification._id)}
      >
        <div className="notificationContent">
          <div className="notificationHeader">
            <span className="notificationTime">{formatTimestamp(notification.createdAt)}</span>
            <span className={`notificationBadge ${notification.actionType.toLowerCase()}`}>
              {notification.actionType}
            </span>
          </div>
          <div className="notificationMessage">{notification.message}</div>
          <div className="notificationMeta">
            <span className="notificationUser">{notification.userEmail}</span>
          </div>
        </div>
        <button
          className="deleteButton"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNotificationDelete(notification._id);
          }}
          title="Hide notification"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    ));
  };

  return (
    <div className="notificationSidebar">
      <div className="notificationHeader">
        <h2>Notifications</h2>
        <div className="notificationActions">
          <button className="closeButton" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
      <button 
            className="summaryButton" 
            onClick={() => toggleSummaryView(notifications)}
            title={isSummaryView ? "Show all notifications" : "View AI Summary"}
            disabled={loading || summaryLoading}
          >
            {summaryLoading ? "Generating..." : "AI Summarize"}
          </button>
      <div className="notificationList">
        {(loading || summaryLoading) ? (
          <div className="emptyNotifications">
            <p>{summaryLoading ? "Generating summary..." : "Loading notifications..."}</p>
          </div>
        ) : isSummaryView ? (
          <div className="notificationSummary">
            <div className="aiUseNotification">
              <FontAwesomeIcon icon={faCircleExclamation} style={{ color: "#b76e00" }} />
              <p>
                Suggestions made by artificial intelligence may sometimes be inaccurate. 
                Please check again for data accuracy.
              </p>
            </div>
            <div className="summaryHeader">
              <FontAwesomeIcon icon={faBrain} />
              <h3>AI Summary</h3>
            </div>
            {summary.split('\n').map((line, index) => (
              <p key={index}>
                {line.includes(':') ? (
                  <>
                    <strong>{line.split(':')[0]}:</strong>
                    <span>{line.split(':')[1]}</span>
                  </>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        ) : (
          renderNotifications()
        )}
      </div>
    </div>
  );
};

NotificationSidebar.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default NotificationSidebar;
