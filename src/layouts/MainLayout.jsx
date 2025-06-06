"use client";

import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useMediaQuery } from "../hooks/useMediaQuery";

/**
 * Main layout component with responsive sidebar and topbar
 */
const MainLayout = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {" "}
      {/* Ensure this doesn't cause overflow if body has overflow-x:hidden */}
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
        toggleSidebar={toggleSidebar}
      />
      {/* Main content panel */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 overflow-x-hidden ${
          // Added overflow-x-hidden
          isSidebarOpen && !isMobile ? "ml-64" : "ml-0 md:ml-20" // Adjusted for collapsed sidebar width on md
        }`}
      >
        {/* Topbar */}
        <Topbar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          {" "}
          {/* Changed overflow-auto to overflow-y-auto and added overflow-x-hidden, added padding */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
