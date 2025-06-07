"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supportApi } from "@/api/supportApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useEffect } from "react";


const Support = () => {
  const [ticket, setTicket] = useState({
    subject: "",
    category: "",
    priority: "",
    description: "",
    attachFile: null,
  });

  const [loading, setLoading] = useState(false);

  const [recentTickets, setRecentTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoadingTickets(true);
      try {
        const res = await supportApi.getMyTickets();
        if (res.success) {
          // res.data is a single ticket object in your example, but often it's an array — adjust accordingly
          // Assuming multiple tickets returned in res.data as array (if your API returns a single ticket, wrap in array)
          // If API returns a single ticket object, wrap it in array:
          const ticketsArray = Array.isArray(res.data) ? res.data : [res.data];
          setRecentTickets(ticketsArray);
        } else {
          toast.error("Failed to load tickets");
        }
      } catch (error) {
        toast.error("Error fetching tickets");
        console.error(error);
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchTickets();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicket((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !ticket.subject.trim() ||
      !ticket.category ||
      !ticket.priority ||
      !ticket.description.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("subject", ticket.subject);
      formData.append("category", ticket.category);
      formData.append("priority", ticket.priority);
      formData.append("description", ticket.description);

      if (ticket.attachFile) {
        formData.append("attachFile", ticket.attachFile);
      }

      // Call API to create ticket
      await supportApi.createTicket(formData);

      toast.success("Support ticket submitted successfully");

      // Reset form
      setTicket({
        subject: "",
        category: "",
        priority: "",
        description: "",
        attachFile: null,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit support ticket");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
        <p className="text-sm text-gray-600 mt-1">
          Get help and submit support tickets
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600 ">
                    jasmineautomate.support@natharts.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-gray-600">+91 9876543210</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-medium">
                    Comming Soon..... {/* How do I reset my password? */}
                  </p>
                </button>
                {/* <button className="w-full text-left p-3 rounded hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-medium">How to apply for leave?</p>
                </button>
                <button className="w-full text-left p-3 rounded hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-medium">How to mark attendance?</p>
                </button>
                <button className="w-full text-left p-3 rounded hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-medium">How to create a task?</p>
                </button> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Ticket Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              Submit a Support Ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={ticket.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your issue"
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={ticket.category}
                    onValueChange={(value) =>
                      setTicket((prev) => ({ ...prev, category: value }))
                    }
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="account">Account Related</SelectItem>
                      <SelectItem value="leave">Leave Management</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="task">Task Management</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select
                    value={ticket.priority}
                    onValueChange={(value) =>
                      setTicket((prev) => ({ ...prev, priority: value }))
                    }
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={ticket.description}
                  onChange={handleInputChange}
                  placeholder="Please provide detailed information about your issue..."
                  className="mt-1"
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="attachFile">Attach Image (optional)</Label>
                <Input
                  id="attachFile"
                  type="file"
                  onChange={(e) =>
                    setTicket((prev) => ({
                      ...prev,
                      attachFile: e.target.files[0],
                    }))
                  }
                  className="mt-1"
                  accept="image/*"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: Only Images (Max 1MB)
                </p>
              </div>

              <Button type="submit" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Recent Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Ticket ID</th>
                  <th className="text-left py-2 px-4">Subject</th>
                  <th className="text-left py-2 px-4">Category</th>
                  <th className="text-left py-2 px-4">Priority</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingTickets ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Loading tickets...
                    </td>
                  </tr>
                ) : recentTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  recentTickets.map((ticket) => (
                    <tr
                      key={ticket.ticketId}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="py-3 px-4 text-sm">{ticket.ticketId}</td>
                      <td className="py-3 px-4 text-sm">{ticket.subject}</td>
                      <td className="py-3 px-4 text-sm">{ticket.category}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {ticket.ticketStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
