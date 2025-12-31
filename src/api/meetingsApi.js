// Meetings API - Handles data persistence with localStorage fallback
const STORAGE_KEY = "meetings_data";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to get data from localStorage
const getLocalMeetings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("[v0] Error reading from localStorage:", error);
    return [];
  }
};

// Helper function to save data to localStorage
const saveLocalMeetings = (meetings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
  } catch (error) {
    console.error("[v0] Error saving to localStorage:", error);
  }
};

// Fetch all meetings
export const fetchMeetings = async () => {
  try {
    // Attempt to fetch from backend API
    const response = await fetch(`${API_BASE_URL}/meetings`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Sync with localStorage
    saveLocalMeetings(data);

    return { success: true, data };
  } catch (error) {
    console.error("[v0] API fetch failed, using localStorage:", error);

    // Fallback to localStorage if API fails
    const localData = getLocalMeetings();
    return { success: true, data: localData, source: "localStorage" };
  }
};

// Create a new meeting
export const createMeeting = async (meetingData) => {
  try {
    // Attempt to create via API
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Update localStorage
    const meetings = getLocalMeetings();
    meetings.push(data);
    saveLocalMeetings(meetings);

    return { success: true, data };
  } catch (error) {
    console.error("[v0] API create failed, using localStorage:", error);

    // Fallback to localStorage
    const newMeeting = {
      id: Date.now(),
      ...meetingData,
      createdAt: new Date().toISOString(),
    };

    const meetings = getLocalMeetings();
    meetings.push(newMeeting);
    saveLocalMeetings(meetings);

    return { success: true, data: newMeeting, source: "localStorage" };
  }
};

// Update a meeting
export const updateMeeting = async (meetingId, meetingData) => {
  try {
    // Attempt to update via API
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Update localStorage
    const meetings = getLocalMeetings();
    const updatedMeetings = meetings.map((m) =>
      m.id === meetingId ? data : m
    );
    saveLocalMeetings(updatedMeetings);

    return { success: true, data };
  } catch (error) {
    console.error("[v0] API update failed, using localStorage:", error);

    // Fallback to localStorage
    const meetings = getLocalMeetings();
    const updatedMeetings = meetings.map((m) =>
      m.id === meetingId ? { ...m, ...meetingData } : m
    );
    saveLocalMeetings(updatedMeetings);

    const updatedMeeting = updatedMeetings.find((m) => m.id === meetingId);
    return { success: true, data: updatedMeeting, source: "localStorage" };
  }
};

// Delete a meeting
export const deleteMeeting = async (meetingId) => {
  try {
    // Attempt to delete via API
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Update localStorage
    const meetings = getLocalMeetings();
    const filteredMeetings = meetings.filter((m) => m.id !== meetingId);
    saveLocalMeetings(filteredMeetings);

    return { success: true };
  } catch (error) {
    console.error("[v0] API delete failed, using localStorage:", error);

    // Fallback to localStorage
    const meetings = getLocalMeetings();
    const filteredMeetings = meetings.filter((m) => m.id !== meetingId);
    saveLocalMeetings(filteredMeetings);

    return { success: true, source: "localStorage" };
  }
};
