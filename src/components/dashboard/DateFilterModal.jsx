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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

const DateFilterModal = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  currentFilter,
}) => {
  const [startDate, setStartDate] = useState(currentFilter.startDate || "");
  const [endDate, setEndDate] = useState(currentFilter.endDate || "");
  const [filterType, setFilterType] = useState(
    currentFilter.filterType || "dueDate"
  );

  const handleApply = () => {
    onApply({
      startDate: startDate || null,
      endDate: endDate || null,
      filterType,
    });
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setFilterType("dueDate");
    onClear();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter by Date</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="filterType">Filter by</Label>
            <RadioGroup
              id="filterType"
              value={filterType}
              onValueChange={setFilterType}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dueDate" id="dueDate" />
                <Label htmlFor="dueDate">Due Date</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="createdDate" id="createdDate" />
                <Label htmlFor="createdDate">Created Date</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completedDate" id="completedDate" />
                <Label htmlFor="completedDate">Completed Date</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleApply}>Apply Filter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DateFilterModal;
