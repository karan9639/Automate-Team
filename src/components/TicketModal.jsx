"use client";

import { useState } from "react";
import { X, Mic, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

const TicketModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    subject: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Simple validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.subCategory)
      newErrors.subCategory = "Sub-category is required";
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.description)
      newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // TODO: Implement API call to submit ticket
      console.log("Ticket data:", { ...formData, files });
      onClose();
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles([...files, ...uploadedFiles]);
  };

  // Get sub-categories based on selected category
  const getSubCategories = () => {
    switch (formData.category) {
      case "technical":
        return [
          { value: "login", label: "Login Issues" },
          { value: "performance", label: "Performance Issues" },
          { value: "error", label: "Error Messages" },
        ];
      case "billing":
        return [
          { value: "payment", label: "Payment Issues" },
          { value: "invoice", label: "Invoice Request" },
          { value: "refund", label: "Refund Request" },
        ];
      case "feature":
        return [
          { value: "request", label: "Feature Request" },
          { value: "suggestion", label: "Improvement Suggestion" },
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Raise a Ticket
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Select Category</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={(e) => {
                handleChange(e);
                setFormData((prev) => ({ ...prev, subCategory: "" }));
              }}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2"
            >
              <option value="">Select Category</option>
              <option value="technical">Technical Support</option>
              <option value="billing">Billing & Payments</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Sub Category */}
          <div className="space-y-2">
            <Label htmlFor="subCategory">Select Sub Category</Label>
            <select
              id="subCategory"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              disabled={!formData.category}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2"
            >
              <option value="">Select Sub Category</option>
              {getSubCategories().map((subCat) => (
                <option key={subCat.value} value={subCat.value}>
                  {subCat.label}
                </option>
              ))}
            </select>
            {errors.subCategory && (
              <p className="text-sm text-red-500">{errors.subCategory}</p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter ticket subject"
            />
            {errors.subject && (
              <p className="text-sm text-red-500">{errors.subject}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
              placeholder="Describe your issue in detail"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload Image/Videos showing your Issue</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="bg-gray-800 border-gray-700 text-white flex-1"
                onClick={() => document.getElementById("file-upload").click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Upload</span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-gray-800 border-gray-700 text-white"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            {files.length > 0 && (
              <div className="text-sm text-gray-400">
                {files.length} file(s) selected
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TicketModal;
