"use client";

import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <span className="mr-2">📅</span>
            Select Date
          </Button>
          <Button size="sm">
            <span className="mr-2">📊</span>
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Tasks
                  </p>
                  <h3 className="text-2xl font-bold mt-1">24</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <span className="text-blue-600">✓</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-xs text-green-600">
                  <span className="mr-1">↑</span>
                  <span>12% increase</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Team Members
                  </p>
                  <h3 className="text-2xl font-bold mt-1">8</h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <span className="text-purple-600">👥</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-xs text-green-600">
                  <span className="mr-1">↑</span>
                  <span>2 new this month</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Attendance Rate
                  </p>
                  <h3 className="text-2xl font-bold mt-1">96%</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <span className="text-green-600">⏰</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-xs text-green-600">
                  <span className="mr-1">↑</span>
                  <span>3% increase</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Pending Approvals
                  </p>
                  <h3 className="text-2xl font-bold mt-1">5</h3>
                </div>
                <div className="p-2 bg-amber-100 rounded-full">
                  <span className="text-amber-600">📅</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-xs text-red-600">
                  <span className="mr-1">⚠️</span>
                  <span>2 urgent</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      {item}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Task #{item} updated
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      📅
                    </div>
                    <div>
                      <p className="text-sm font-medium">Team Meeting</p>
                      <p className="text-xs text-gray-500">
                        Tomorrow, 10:00 AM
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Task Overview</h3>
            <p>Task content goes here</p>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Attendance Overview</h3>
            <p>Attendance content goes here</p>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Team Overview</h3>
            <p>Team content goes here</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
