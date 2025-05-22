"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import MyTasksTab from "./MyTasksTab";
import DelegatedTasksTab from "./DelegatedTasksTab";
import AllTasksTab from "./AllTasksTab";
import AssignTaskModal from "../../components/modals/AssignTaskModal";
import { Button } from "../../components/ui/button";
import { Check } from "lucide-react";

const TaskManagement = () => {
  const [activeTab, setActiveTab] = useState("my-tasks");
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);

  // Get tasks from Redux store
  const { tasks } = useSelector((state) => state.tasks);

  // Filter tasks based on active tab
  const myTasks = tasks.filter((task) => task.assignedToMe);
  const delegatedTasks = tasks.filter(
    (task) => !task.assignedToMe && task.assignedBy === "currentUser"
  );
  const allTasks = tasks;

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Open assign task modal
  const handleOpenAssignTaskModal = () => {
    setIsAssignTaskModalOpen(true);
  };

  // Close assign task modal
  const handleCloseAssignTaskModal = () => {
    setIsAssignTaskModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <Button
          onClick={handleOpenAssignTaskModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <Check className="mr-2 h-4 w-4" /> Assign Task
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="delegated-tasks">Delegated Tasks</TabsTrigger>
          <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="my-tasks">
          <MyTasksTab tasks={myTasks} />
        </TabsContent>
        <TabsContent value="delegated-tasks">
          <DelegatedTasksTab tasks={delegatedTasks} />
        </TabsContent>
        <TabsContent value="all-tasks">
          <AllTasksTab tasks={allTasks} />
        </TabsContent>
      </Tabs>

      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={handleCloseAssignTaskModal}
      />
    </div>
  );
};

export default TaskManagement;
