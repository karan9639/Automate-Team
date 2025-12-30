"use client";

import { useState, useEffect } from "react";
import { fetchMeetingData, fetchMembers } from "../services/mockApi";
import "../styles/meetingsSidebar.css";

const MeetingsSidebar = ({ meetingId, isOpen, onClose }) => {
  const [meetingData, setMeetingData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    type: "",
    department: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen && meetingId) {
      loadMeetingData();
    }
  }, [isOpen, meetingId]);

  const loadMeetingData = async () => {
    setLoading(true);
    try {
      const [meeting, membersData] = await Promise.all([
        fetchMeetingData(meetingId),
        fetchMembers(),
      ]);
      setMeetingData(meeting);
      setMembers(membersData);
      setEditForm({
        title: meeting.title,
        date: formatDateForInput(meeting.date),
        type: meeting.type,
        department: meeting.department,
        description: Array.isArray(meeting.description)
          ? meeting.description.join("\n")
          : meeting.description,
      });
    } catch (error) {
      console.error("Error loading meeting data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("-")) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const parseDescription = (desc) => {
    if (Array.isArray(desc)) return desc;
    if (typeof desc === "string") {
      return desc.split("\n").filter((line) => line.trim());
    }
    return [];
  };

  const getTotalMembers = () => {
    if (!meetingData || !members.length) return [];
    return members.filter((member) =>
      meetingData.totalMembers.includes(member.id)
    );
  };

  const getOtherMembers = () => {
    if (!meetingData || !members.length) return [];
    return members.filter(
      (member) =>
        meetingData.members.includes(member.id) &&
        !meetingData.totalMembers.includes(member.id)
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setMeetingData({
      ...meetingData,
      title: editForm.title,
      date: formatDateForDisplay(editForm.date),
      type: editForm.type,
      department: editForm.department,
      description: editForm.description,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      title: meetingData.title,
      date: formatDateForInput(meetingData.date),
      type: meetingData.type,
      department: meetingData.department,
      description: Array.isArray(meetingData.description)
        ? meetingData.description.join("\n")
        : meetingData.description,
    });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="meetings-sidebar-overlay" onClick={onClose} />
      <div className={`meetings-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        {/* Header */}
        <div className="meetings-sidebar-header">
          <div className="header-title">
            <h2>Meeting Details</h2>
            <button
              className="collapse-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? "→" : "←"}
            </button>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {!isCollapsed && (
          <div className="meetings-sidebar-content">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading meeting details...</p>
              </div>
            ) : !meetingData ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 11H15M9 15H15M21 10C21 11.6569 19.6569 13 18 13H17.5M17.5 13C17.5 14.933 15.933 16.5 14 16.5H10C8.067 16.5 6.5 14.933 6.5 13H6C4.34315 13 3 11.6569 3 10V9C3 7.34315 4.34315 6 6 6H18C19.6569 6 21 7.34315 21 9V10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3>No Meeting Found</h3>
                <p>The meeting details could not be loaded.</p>
              </div>
            ) : (
              <>
                {/* Edit Controls */}
                <div className="edit-controls">
                  {!isEditing ? (
                    <button className="btn-edit" onClick={handleEdit}>
                      Edit
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="btn-save" onClick={handleSave}>
                        Save
                      </button>
                      <button className="btn-cancel" onClick={handleCancel}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Meeting Details */}
                <div className="meeting-details">
                  {/* Meeting Title */}
                  <div className="detail-row">
                    <label className="detail-label">Meeting Title</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="detail-input"
                        value={editForm.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                      />
                    ) : (
                      <div className="detail-value detail-title">
                        {meetingData.title}
                      </div>
                    )}
                  </div>

                  {/* Meeting Date */}
                  <div className="detail-row">
                    <label className="detail-label">Meeting Date</label>
                    {isEditing ? (
                      <input
                        type="date"
                        className="detail-input"
                        value={editForm.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                      />
                    ) : (
                      <div className="detail-value">{meetingData.date}</div>
                    )}
                  </div>

                  {/* Meeting Type */}
                  <div className="detail-row">
                    <label className="detail-label">Meeting Type</label>
                    {isEditing ? (
                      <div className="radio-group">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="type"
                            value="Online"
                            checked={editForm.type === "Online"}
                            onChange={(e) =>
                              handleInputChange("type", e.target.value)
                            }
                          />
                          <span>Online</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="type"
                            value="Offline"
                            checked={editForm.type === "Offline"}
                            onChange={(e) =>
                              handleInputChange("type", e.target.value)
                            }
                          />
                          <span>Offline</span>
                        </label>
                      </div>
                    ) : (
                      <span
                        className={`badge badge-${meetingData.type.toLowerCase()}`}
                      >
                        {meetingData.type}
                      </span>
                    )}
                  </div>

                  {/* Department */}
                  <div className="detail-row">
                    <label className="detail-label">Department</label>
                    {isEditing ? (
                      <select
                        className="detail-select"
                        value={editForm.department}
                        onChange={(e) =>
                          handleInputChange("department", e.target.value)
                        }
                      >
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                      </select>
                    ) : (
                      <span className="badge badge-department">
                        {meetingData.department}
                      </span>
                    )}
                  </div>

                  {/* Created By */}
                  <div className="detail-row">
                    <label className="detail-label">Created By</label>
                    <div className="detail-value">{meetingData.createdBy}</div>
                  </div>

                  {/* Meeting Members - Total Members */}
                  <div className="detail-row members-row">
                    <label className="detail-label">Total Members</label>
                    <div className="members-list">
                      {getTotalMembers().length > 0 ? (
                        getTotalMembers().map((member) => (
                          <div key={member.id} className="member-item">
                            <div className="member-avatar">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="member-info">
                              <div className="member-name">{member.name}</div>
                              <div className="member-role">{member.role}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-members">No members assigned</div>
                      )}
                    </div>
                  </div>

                  {/* Meeting Members - Others */}
                  <div className="detail-row members-row">
                    <label className="detail-label">Others</label>
                    <div className="members-list">
                      {getOtherMembers().length > 0 ? (
                        getOtherMembers().map((member) => (
                          <div key={member.id} className="member-item">
                            <div className="member-avatar member-avatar-other">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="member-info">
                              <div className="member-name">{member.name}</div>
                              <div className="member-role">{member.role}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-members">None</div>
                      )}
                    </div>
                  </div>

                  {/* Meeting Description */}
                  <div className="detail-row description-row">
                    <label className="detail-label">Meeting Description</label>
                    {isEditing ? (
                      <textarea
                        className="detail-textarea"
                        value={editForm.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows="6"
                        placeholder="Enter description with each point on a new line"
                      />
                    ) : (
                      <div className="detail-description">
                        <ol className="description-list">
                          {parseDescription(meetingData.description).map(
                            (point, index) => (
                              <li key={index} className="description-item">
                                {point.replace(/^\d+\.\s*/, "")}
                              </li>
                            )
                          )}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MeetingsSidebar;
