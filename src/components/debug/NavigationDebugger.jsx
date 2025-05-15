"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ROUTES } from "../../constants/routes";

/**
 * Navigation Debugger Component
 * Helps diagnose navigation issues by showing current route info
 * and providing direct navigation to key routes
 * Only visible in development mode
 */
const NavigationDebugger = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState([]);

  // Track navigation history
  useEffect(() => {
    setNavigationHistory((prev) => {
      const newHistory = [...prev, location.pathname];
      // Keep only the last 5 entries
      return newHistory.slice(-5);
    });
  }, [location.pathname]);

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Quick navigation links for testing
  const quickLinks = [
    { name: "Dashboard", path: ROUTES.DASHBOARD },
    { name: "Tasks", path: ROUTES.TASKS.MANAGEMENT },
    { name: "Task Directory", path: ROUTES.TASKS.DIRECTORY },
    { name: "Task Templates", path: ROUTES.TASKS.TEMPLATES },
    { name: "My Leaves", path: ROUTES.LEAVES.MY },
    { name: "All Leaves", path: ROUTES.LEAVES.ALL },
    { name: "My Attendance", path: ROUTES.ATTENDANCE.MY },
    { name: "Settings", path: ROUTES.SETTINGS },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-xs w-full">
        <div
          className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-sm font-medium">Navigation Debugger</h3>
          <span>{isExpanded ? "▼" : "▲"}</span>
        </div>

        {isExpanded && (
          <div className="p-4 text-xs">
            <div className="mb-4">
              <p className="font-semibold">Current Path:</p>
              <code className="bg-gray-100 px-2 py-1 rounded block mt-1 overflow-auto">
                {location.pathname}
              </code>
            </div>

            <div className="mb-4">
              <p className="font-semibold">Navigation History:</p>
              <div className="mt-1 bg-gray-100 p-2 rounded max-h-24 overflow-y-auto">
                {navigationHistory.map((path, index) => (
                  <div
                    key={index}
                    className="text-xs py-1 border-b border-gray-200 last:border-0"
                  >
                    {path}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="font-semibold">Quick Navigation:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold">Manual Navigation:</p>
              <div className="flex mt-2">
                <input
                  type="text"
                  id="path"
                  placeholder="/path/to/navigate"
                  className="flex-1 px-2 py-1 border rounded-l text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate(e.target.value);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const path = document.getElementById("path").value;
                    navigate(path);
                  }}
                  className="bg-blue-600 text-white px-2 py-1 rounded-r text-xs"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationDebugger;
