// Utility function to conditionally join class names
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Format date to readable format
export function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Calculate date difference in days
export function dateDiffInDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end days
}

// Get status color based on status string
export function getStatusColor(status) {
  const statusColors = {
    pending: "amber",
    approved: "green",
    rejected: "red",
    completed: "green",
    "in-progress": "blue",
    overdue: "red",
  };

  return statusColors[status] || "gray";
}

// Format time (HH:MM)
export function formatTime(timeString) {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":");
  const hour = Number.parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minutes} ${ampm}`;
}
