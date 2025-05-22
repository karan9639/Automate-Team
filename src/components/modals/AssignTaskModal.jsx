"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Check, Link, FileText, ImageIcon, Clock, Mic } from "lucide-react";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";

const AssignTaskModal = ({ isOpen, onClose }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("high");
  const [assignMoreTasks, setAssignMoreTasks] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create task object
    const newTask = {
      title: taskTitle,
      description: taskDescription,
      priority: selectedPriority,
      isRepeating,
      dueDate,
      // Add other fields as needed
    };

    // Handle task creation logic here
    console.log("Creating new task:", newTask);

    // Close modal if not assigning more tasks
    if (!assignMoreTasks) {
      onClose();
    }

    // Reset form
    setTaskTitle("");
    setTaskDescription("");
    setSelectedPriority("high");
    setIsRepeating(false);
    setDueDate("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Assign New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div>
            <label htmlFor="taskTitle" className="text-sm font-medium">
              Task Title
            </label>
            <Input
              id="taskTitle"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder=""
              className="mt-1"
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <Textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Short description of the task..."
              className="mt-1 bg-gray-50"
              rows={4}
            />
          </div>

          {/* Select Users and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Button
                variant="outline"
                className="w-full justify-between text-left"
              >
                Select Users
                <span className="ml-2">▼</span>
              </Button>
            </div>
            <div>
              <Button
                variant="outline"
                className="w-full justify-between text-left"
              >
                Select Category
                <span className="ml-2">▼</span>
              </Button>
            </div>
          </div>

          {/* Keep in Loop */}
          <div>
            <Button
              variant="outline"
              className="w-full justify-between text-left"
            >
              Select Users to Keep in Loop
              <span className="ml-2">▼</span>
            </Button>
          </div>

          {/* Priority */}
          <div>
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                <span className="mr-2">🚩</span>
                <span>Priority</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setSelectedPriority("high")}
                className={`${
                  selectedPriority === "high"
                    ? "bg-emerald-500 text-white"
                    : "bg-white"
                } border rounded-md px-4 py-2`}
              >
                {selectedPriority === "high" && (
                  <Check className="h-4 w-4 mr-1" />
                )}
                High
              </Button>
              <Button
                type="button"
                onClick={() => setSelectedPriority("medium")}
                className={`${
                  selectedPriority === "medium"
                    ? "bg-emerald-500 text-white"
                    : "bg-white"
                } border rounded-md px-4 py-2`}
                variant="outline"
              >
                Medium
              </Button>
              <Button
                type="button"
                onClick={() => setSelectedPriority("low")}
                className={`${
                  selectedPriority === "low"
                    ? "bg-emerald-500 text-white"
                    : "bg-white"
                } border rounded-md px-4 py-2`}
                variant="outline"
              >
                Low
              </Button>
            </div>
          </div>

          {/* Repeat */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="mr-2">🔄</span>
              <span>Repeat</span>
            </div>
            <Checkbox checked={isRepeating} onCheckedChange={setIsRepeating} />
          </div>

          {/* Due Date */}
          <div>
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                <span className="mr-2">📅</span>
                <span>Due Date</span>
              </div>
            </div>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Attachment Options */}
          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2"
              size="icon"
            >
              <Link className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2"
              size="icon"
            >
              <FileText className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2"
              size="icon"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2"
              size="icon"
            >
              <Clock className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full p-2"
              size="icon"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>

          {/* Assign More Tasks Toggle */}
          <div className="flex justify-end items-center gap-2 pt-4">
            <span>Assign More Tasks</span>
            <Switch
              checked={assignMoreTasks}
              onCheckedChange={setAssignMoreTasks}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Check className="mr-2 h-4 w-4" /> Assign Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTaskModal;
