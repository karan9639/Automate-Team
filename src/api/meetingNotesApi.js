import API from "./axiosInstance"

// Fetch all meeting notes
export const fetchMeetingNotes = async () => {
  try {
    const response = await API.get("/user/meetingnotes")
    return {
      success: true,
      data: response.data?.data || response.data || [],
    }
  } catch (error) {
    console.error("[v0] Error fetching meeting notes:", error)
    throw error
  }
}

// Create a new meeting note
export const createMeetingNote = async (meetingNoteData) => {
  try {
    const response = await API.post("/user/create-meetingnote", meetingNoteData)
    return {
      success: true,
      data: response.data?.data || response.data,
    }
  } catch (error) {
    console.error("[v0] Error creating meeting note:", error)
    throw error
  }
}

// Update a meeting note
export const updateMeetingNote = async (meetingNoteId, meetingNoteData) => {
  try {
    const response = await API.patch(`/user/edit-meetingnote/${meetingNoteId}`, meetingNoteData)
    return {
      success: true,
      data: response.data?.data || response.data,
    }
  } catch (error) {
    console.error("[v0] Error updating meeting note:", error)
    throw error
  }
}

// Delete a meeting note
export const deleteMeetingNote = async (meetingNoteId) => {
  try {
    const response = await API.delete(`/user/delete-meetingnote/${meetingNoteId}`)
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error("[v0] Error deleting meeting note:", error)
    throw error
  }
}
