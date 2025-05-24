"use client";

import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Send } from "lucide-react";

const TaskComments = ({ task, onAddComment }) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !task) return;

    setIsSubmitting(true);
    try {
      await onAddComment(task.id, comment);
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  if (!task) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Task Comments
          </h3>
          <p className="text-gray-500">
            Select a task to view and add comments
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Task Comments</h3>
      <div className="mb-4">
        <h4 className="font-medium text-gray-800">{task.name}</h4>
        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Comments ({task.comments.length})
        </h4>

        <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4">
          {task.comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet</p>
          ) : (
            task.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm">{comment.user}</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-2"
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!comment.trim() || isSubmitting}
              className="flex items-center gap-1"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Sending..." : "Add Comment"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default TaskComments;
