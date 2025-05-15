// Mock data for dashboard
const taskStats = {
  total: 24,
  completed: 16,
  inProgress: 5,
  pending: 3,
};

const recentTasks = [
  {
    id: 1,
    title: "Complete project proposal",
    status: "In Progress",
    dueDate: "2023-06-15",
  },
  {
    id: 2,
    title: "Review client feedback",
    status: "Pending",
    dueDate: "2023-06-18",
  },
  {
    id: 3,
    title: "Update documentation",
    status: "Completed",
    dueDate: "2023-06-10",
  },
];

const teamMembers = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Project Manager",
    tasks: 8,
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "Developer",
    tasks: 12,
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: 3,
    name: "Michael Brown",
    role: "Designer",
    tasks: 6,
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
  },
];

// Status Card Component
const StatusCard = ({ title, value, color }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${color}`}>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
};

// Task List Component
const TaskList = ({ tasks }) => {
  // Status color mapping
  const statusColors = {
    Completed: "bg-green-100 text-green-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Recent Tasks</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{task.title}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  statusColors[task.status]
                }`}
              >
                {task.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Due: {task.dueDate}</p>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 border-t">
        <a
          href="/tasks"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All Tasks
        </a>
      </div>
    </div>
  );
};

// Team Members Component
const TeamMembers = ({ members }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Team Members</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-4 hover:bg-gray-50 flex items-center"
          >
            <img
              src={member.avatar || "/placeholder.svg"}
              alt={member.name}
              className="w-10 h-10 rounded-full mr-4"
            />
            <div className="flex-1">
              <h3 className="font-medium">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium">{member.tasks} tasks</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 border-t">
        <a
          href="/team"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All Members
        </a>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCard
          title="Total Tasks"
          value={taskStats.total}
          color="border-gray-500"
        />
        <StatusCard
          title="Completed"
          value={taskStats.completed}
          color="border-green-500"
        />
        <StatusCard
          title="In Progress"
          value={taskStats.inProgress}
          color="border-blue-500"
        />
        <StatusCard
          title="Pending"
          value={taskStats.pending}
          color="border-yellow-500"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2">
          <TaskList tasks={recentTasks} />
        </div>

        {/* Team Members */}
        <div>
          <TeamMembers members={teamMembers} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
