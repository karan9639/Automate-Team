"use client";

import { useState } from "react";
import { Save, User, Bell, Lock, Globe, Mail, Moon, Sun } from "lucide-react";

const Settings = () => {
  // Profile settings
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    role: "Product Manager",
    department: "Product",
    bio: "Passionate about building great products and leading teams to success.",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskAssigned: true,
    taskUpdated: true,
    taskCompleted: true,
    leaveRequests: true,
    teamUpdates: true,
    weeklyDigest: true,
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "light",
    language: "en",
    timeZone: "UTC-5",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  });

  // Security settings
  const [security] = useState({
    lastPasswordChange: "45 days ago",
    twoFactorAuth: false,
  });

  // Handle profile update
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // In a real application, we would save profile to the backend
    alert("Profile updated successfully!");
  };

  // Handle notification toggle
  const handleNotificationToggle = (setting) => {
    setNotifications({
      ...notifications,
      [setting]: !notifications[setting],
    });
  };

  // Handle theme change
  const handleThemeChange = (theme) => {
    setAppearance({
      ...appearance,
      theme,
    });
  };

  // Toggle switch component
  const ToggleSwitch = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <form
          onSubmit={handleProfileUpdate}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-4 bg-gray-50 border-b flex items-center">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Profile Settings
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Job Role
              </label>
              <input
                type="text"
                id="role"
                value={profile.role}
                onChange={(e) =>
                  setProfile({ ...profile, role: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700"
              >
                Department
              </label>
              <select
                id="department"
                value={profile.department}
                onChange={(e) =>
                  setProfile({ ...profile, department: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50 text-right">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center">
            <Bell className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Notification Settings
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Email and Push Notifications
              </h3>
              <div className="space-y-3">
                <ToggleSwitch
                  enabled={notifications.emailNotifications}
                  onChange={() =>
                    handleNotificationToggle("emailNotifications")
                  }
                  label="Email Notifications"
                />
                <ToggleSwitch
                  enabled={notifications.pushNotifications}
                  onChange={() => handleNotificationToggle("pushNotifications")}
                  label="Push Notifications"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Task Notifications
              </h3>
              <div className="space-y-3">
                <ToggleSwitch
                  enabled={notifications.taskAssigned}
                  onChange={() => handleNotificationToggle("taskAssigned")}
                  label="Task Assigned"
                />
                <ToggleSwitch
                  enabled={notifications.taskUpdated}
                  onChange={() => handleNotificationToggle("taskUpdated")}
                  label="Task Updated"
                />
                <ToggleSwitch
                  enabled={notifications.taskCompleted}
                  onChange={() => handleNotificationToggle("taskCompleted")}
                  label="Task Completed"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">
                Other Notifications
              </h3>
              <div className="space-y-3">
                <ToggleSwitch
                  enabled={notifications.leaveRequests}
                  onChange={() => handleNotificationToggle("leaveRequests")}
                  label="Leave Requests"
                />
                <ToggleSwitch
                  enabled={notifications.teamUpdates}
                  onChange={() => handleNotificationToggle("teamUpdates")}
                  label="Team Updates"
                />
                <ToggleSwitch
                  enabled={notifications.weeklyDigest}
                  onChange={() => handleNotificationToggle("weeklyDigest")}
                  label="Weekly Digest"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center">
            <Globe className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Appearance & Localization
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Theme</h3>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleThemeChange("light")}
                  className={`flex items-center justify-center px-4 py-2 rounded-md ${
                    appearance.theme === "light"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300"
                  }`}
                >
                  <Sun className="h-5 w-5 mr-2" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange("dark")}
                  className={`flex items-center justify-center px-4 py-2 rounded-md ${
                    appearance.theme === "dark"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300"
                  }`}
                >
                  <Moon className="h-5 w-5 mr-2" />
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange("system")}
                  className={`flex items-center justify-center px-4 py-2 rounded-md ${
                    appearance.theme === "system"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300"
                  }`}
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                  System
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-700"
                >
                  Language
                </label>
                <select
                  id="language"
                  value={appearance.language}
                  onChange={(e) =>
                    setAppearance({ ...appearance, language: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="timeZone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Time Zone
                </label>
                <select
                  id="timeZone"
                  value={appearance.timeZone}
                  onChange={(e) =>
                    setAppearance({ ...appearance, timeZone: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="UTC-12">UTC-12</option>
                  <option value="UTC-11">UTC-11</option>
                  <option value="UTC-10">UTC-10</option>
                  <option value="UTC-9">UTC-9</option>
                  <option value="UTC-8">UTC-8 (PST)</option>
                  <option value="UTC-7">UTC-7 (MST)</option>
                  <option value="UTC-6">UTC-6 (CST)</option>
                  <option value="UTC-5">UTC-5 (EST)</option>
                  <option value="UTC-4">UTC-4</option>
                  <option value="UTC-3">UTC-3</option>
                  <option value="UTC-2">UTC-2</option>
                  <option value="UTC-1">UTC-1</option>
                  <option value="UTC+0">UTC+0</option>
                  <option value="UTC+1">UTC+1</option>
                  <option value="UTC+2">UTC+2</option>
                  <option value="UTC+3">UTC+3</option>
                  <option value="UTC+4">UTC+4</option>
                  <option value="UTC+5">UTC+5</option>
                  <option value="UTC+5:30">UTC+5:30 (IST)</option>
                  <option value="UTC+6">UTC+6</option>
                  <option value="UTC+7">UTC+7</option>
                  <option value="UTC+8">UTC+8</option>
                  <option value="UTC+9">UTC+9 (JST)</option>
                  <option value="UTC+10">UTC+10</option>
                  <option value="UTC+11">UTC+11</option>
                  <option value="UTC+12">UTC+12</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="dateFormat"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date Format
                </label>
                <select
                  id="dateFormat"
                  value={appearance.dateFormat}
                  onChange={(e) =>
                    setAppearance({ ...appearance, dateFormat: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="timeFormat"
                  className="block text-sm font-medium text-gray-700"
                >
                  Time Format
                </label>
                <select
                  id="timeFormat"
                  value={appearance.timeFormat}
                  onChange={(e) =>
                    setAppearance({ ...appearance, timeFormat: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="12h">12-hour (1:30 PM)</option>
                  <option value="24h">24-hour (13:30)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center">
            <Lock className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Security Settings
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Password</h3>
                <p className="text-sm text-gray-500">
                  Last changed {security.lastPasswordChange}
                </p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Change Password
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-500">
                  {security.twoFactorAuth
                    ? "Enabled"
                    : "Add an extra layer of security to your account"}
                </p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                {security.twoFactorAuth ? "Manage" : "Enable"}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Active Sessions
                </h3>
                <p className="text-sm text-gray-500">
                  View and manage devices where you're currently logged in
                </p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center">
            <Mail className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Connected Accounts
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg
                  className="h-8 w-8 mr-3"
                  viewBox="0 0 24 24"
                  fill="#4285F4"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                    fill="white"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 4.8C14.4654 4.8 16.5797 5.8044 18.0972 7.38C17.4863 8.06 16.8055 8.70 16.0958 9.3C15.1086 8.2644 13.656 7.65 12 7.65C9.0951 7.65 6.75 9.9951 6.75 12.9C6.75 15.8049 9.0951 18.15 12 18.15C14.4915 18.15 16.5719 16.5447 17.0826 14.25H12V11.4H20.0743C20.1621 11.9647 20.2061 12.5502 20.2061 13.1502C20.2061 17.4273 16.7642 20.7 12 20.7C7.0374 20.7 3 16.6626 3 11.7C3 6.7374 7.0374 2.7 12 2.7C14.5265 2.7 16.8058 3.7098 18.5147 5.3481L16.2204 7.5591C15.0779 6.4443 13.6035 5.8 12 5.8C8.6863 5.8 6 8.4863 6 11.8C6 15.1137 8.6863 17.8 12 17.8C15.0284 17.8 17.5512 15.5926 17.9334 12.7H12V9.9H20.2286C20.2753 10.4977 20.3 11.1128 20.3 11.7C20.3 17.1751 16.7016 21.6 12 21.6C6.9249 21.6 2.7 17.3751 2.7 12.3C2.7 7.2249 6.9249 3 12 3C14.2928 3 16.3953 3.9047 17.9682 5.3682L12 4.8Z"
                    fill="#4285F4"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Google</h3>
                  <p className="text-xs text-gray-500">Not connected</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Connect
              </button>
            </div>

            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg
                  className="h-8 w-8 mr-3"
                  viewBox="0 0 24 24"
                  fill="#1DA1F2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                    fill="white"
                  />
                  <path
                    d="M9.80408 18.33C15.1261 18.33 18.0361 13.92 18.0361 10.098C18.0361 9.972 18.0361 9.846 18.0241 9.726C18.5941 9.318 19.0861 8.808 19.4761 8.226C18.9601 8.454 18.4021 8.61 17.8141 8.682C18.4141 8.322 18.8701 7.758 19.0861 7.08C18.5281 7.41 17.9101 7.65 17.2501 7.782C16.7221 7.224 15.9721 6.9 15.1381 6.9C13.5421 6.9 12.2461 8.196 12.2461 9.792C12.2461 10.02 12.2701 10.242 12.3301 10.452C9.91808 10.326 7.78808 9.18 6.35408 7.44C6.10808 7.872 5.96408 8.322 5.96408 8.814C5.96408 9.732 6.42408 10.548 7.13408 11.016C6.65408 11.004 6.19808 10.872 5.79608 10.662C5.79608 10.674 5.79608 10.686 5.79608 10.704C5.79608 12.102 6.78608 13.272 8.11208 13.542C7.87208 13.608 7.61408 13.644 7.34408 13.644C7.16408 13.644 6.98408 13.626 6.81608 13.584C7.17608 14.73 8.24408 15.558 9.50408 15.582C8.50808 16.35 7.26608 16.806 5.92208 16.806C5.69408 16.806 5.47208 16.794 5.25008 16.764C6.52208 17.58 8.04608 18.048 9.68408 18.048"
                    fill="#1DA1F2"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Twitter</h3>
                  <p className="text-xs text-gray-500">Not connected</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Connect
              </button>
            </div>

            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <svg
                  className="h-8 w-8 mr-3"
                  viewBox="0 0 24 24"
                  fill="#0A66C2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                    fill="white"
                  />
                  <path
                    d="M19.2 19.2H16.384V14.949C16.384 13.949 16.363 12.67 14.991 12.67C13.598 12.67 13.387 13.748 13.387 14.862V19.2H10.571V9.6H13.264V10.843H13.304C13.674 10.123 14.598 9.36 16.003 9.36C18.859 9.36 19.2 11.152 19.2 13.473V19.2ZM7.116 8.357C6.299 8.357 5.64 7.693 5.64 6.879C5.64 6.064 6.299 5.4 7.116 5.4C7.929 5.4 8.592 6.064 8.592 6.879C8.592 7.693 7.929 8.357 7.116 8.357ZM8.529 19.2H5.703V9.6H8.529V19.2Z"
                    fill="#0A66C2"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    LinkedIn
                  </h3>
                  <p className="text-xs text-gray-500">Not connected</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
