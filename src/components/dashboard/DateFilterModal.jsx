"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const DateFilterModal = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  currentFilter,
}) => {
  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    filterType: "dueDate",
  });

  useEffect(() => {
    if (currentFilter) {
      setFilter({
        startDate: currentFilter.startDate || "",
        endDate: currentFilter.endDate || "",
        filterType: currentFilter.filterType || "dueDate",
      });
    }
  }, [currentFilter, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApply = () => {
    onApply(filter);
  };

  const handleClear = () => {
    onClear();
  };

  const handlePreset = (preset) => {
    const today = new Date();
    let startDate = "";
    let endDate = "";

    switch (preset) {
      case "today":
        startDate = today.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      case "thisWeek":
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - today.getDay());
        const lastDay = new Date(today);
        lastDay.setDate(today.getDate() + (6 - today.getDay()));
        startDate = firstDay.toISOString().split("T")[0];
        endDate = lastDay.toISOString().split("T")[0];
        break;
      case "thisMonth":
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        const lastDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        startDate = firstDayOfMonth.toISOString().split("T")[0];
        endDate = lastDayOfMonth.toISOString().split("T")[0];
        break;
      case "nextWeek":
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() - today.getDay() + 7);
        const nextWeekEnd = new Date(today);
        nextWeekEnd.setDate(today.getDate() - today.getDay() + 13);
        startDate = nextWeekStart.toISOString().split("T")[0];
        endDate = nextWeekEnd.toISOString().split("T")[0];
        break;
      default:
        break;
    }

    setFilter((prev) => ({
      ...prev,
      startDate,
      endDate,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Filter by Date
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="filterType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter Type
              </label>
              <select
                id="filterType"
                name="filterType"
                value={filter.filterType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dueDate">Due Date</option>
                <option value="createdDate">Created Date</option>
                <option value="completedDate">Completed Date</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={filter.startDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={filter.endDate}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePreset("today")}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePreset("thisWeek")}
              >
                This Week
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePreset("thisMonth")}
              >
                This Month
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePreset("nextWeek")}
              >
                Next Week
              </Button>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                Clear Filter
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleApply}>Apply Filter</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateFilterModal;
