"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";

const GenerateReportModal = ({
  isOpen,
  onClose,
  onGenerate,
  tasksCount,
  kpis,
}) => {
  const [reportConfig, setReportConfig] = useState({
    includeKPIs: true,
    includeTasks: true,
    includeActivities: true,
    includeCharts: true,
    format: "json",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    const { name, checked, value, type } = e.target;
    setReportConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(reportConfig);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generate Report
          </h2>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                Your report will include data for {tasksCount} tasks and{" "}
                {kpis.activeUsers} users.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="includeKPIs"
                  checked={reportConfig.includeKPIs}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Include KPIs and metrics</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="includeTasks"
                  checked={reportConfig.includeTasks}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Include task details</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="includeActivities"
                  checked={reportConfig.includeActivities}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Include activity history</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="includeCharts"
                  checked={reportConfig.includeCharts}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Include chart data</span>
              </label>
            </div>

            <div>
              <label
                htmlFor="format"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Report Format
              </label>
              <select
                id="format"
                name="format"
                value={reportConfig.format}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateReportModal;
