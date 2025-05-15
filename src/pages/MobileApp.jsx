import { Download } from "lucide-react";

const MobileApp = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mobile App</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Android App</h2>
          <p className="text-gray-600 mb-4">
            Download our Android app to manage your tasks, attendance, and
            leaves on the go.
          </p>
          <button className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
            <Download size={18} />
            <span>Download for Android</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">iOS App</h2>
          <p className="text-gray-600 mb-4">
            Download our iOS app to manage your tasks, attendance, and leaves on
            the go.
          </p>
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
            <Download size={18} />
            <span>Download for iOS</span>
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">App Features</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Track your attendance and leaves</li>
          <li>Manage tasks and view task status</li>
          <li>Receive notifications for important updates</li>
          <li>Access team information and events</li>
          <li>Submit leave applications on the go</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileApp;
