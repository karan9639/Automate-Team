"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

const GenerateReportModal = ({
  isOpen,
  onClose,
  onGenerate,
  tasksCount,
  kpis,
}) => {
  const [reportName, setReportName] = useState(
    `Task Report - ${new Date().toLocaleDateString()}`
  );
  const [includeOptions, setIncludeOptions] = useState({
    tasks: true,
    kpis: true,
    charts: true,
    activities: true,
  });

  const handleOptionChange = (option) => {
    setIncludeOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleGenerate = () => {
    onGenerate({
      reportName,
      includeOptions,
      generatedAt: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="reportName">Report Name</Label>
            <Input
              id="reportName"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Enter report name"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label>Include in Report</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTasks"
                  checked={includeOptions.tasks}
                  onCheckedChange={() => handleOptionChange("tasks")}
                />
                <Label htmlFor="includeTasks" className="text-sm font-normal">
                  Tasks ({tasksCount})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeKpis"
                  checked={includeOptions.kpis}
                  onCheckedChange={() => handleOptionChange("kpis")}
                />
                <Label htmlFor="includeKpis" className="text-sm font-normal">
                  KPIs (Completed: {kpis?.completedTasks || 0}, Overdue:{" "}
                  {kpis?.overdueTasks || 0})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={includeOptions.charts}
                  onCheckedChange={() => handleOptionChange("charts")}
                />
                <Label htmlFor="includeCharts" className="text-sm font-normal">
                  Charts & Visualizations
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeActivities"
                  checked={includeOptions.activities}
                  onCheckedChange={() => handleOptionChange("activities")}
                />
                <Label
                  htmlFor="includeActivities"
                  className="text-sm font-normal"
                >
                  Recent Activities
                </Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label>Report Format</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="radio"
                id="formatJson"
                name="format"
                defaultChecked
              />
              <Label htmlFor="formatJson" className="text-sm font-normal">
                JSON
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>Generate Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateReportModal;
