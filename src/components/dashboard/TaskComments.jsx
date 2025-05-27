"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
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

  // Function to format the timestamp
  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {task ? `Comments for "${task.name}"` : "Task Comments"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {task ? (
          <>
            <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4 pr-2">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex space-x-3 pb-3 border-b border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <span className="text-xs font-bold">
                        {comment.user.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.user}
                        </p>
                        <span className="ml-2 text-xs text-gray-500">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-gray-500">No comments yet</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex items-start space-x-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 min-h-[80px]"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!comment.trim() || isSubmitting}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">Select a task to view comments</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskComments;
