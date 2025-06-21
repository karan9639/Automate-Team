// src/hooks/useActivities.js
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {userApi }from "../api/userApi";

const useActivities = (isRefreshing) => {
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);

  useEffect(() => {
    const fetchActivitiesData = async () => {
      setActivitiesLoading(true);
      setActivitiesError(null);
      try {
        const response = await userApi.fetchActivities();
        if (response.data?.success && Array.isArray(response.data.data)) {
          const parsed = response.data.data.map((activity) => {
            const message = activity.message;
            const type = activity.messageType;
            const user = message?.split(" ")[0] || "User";

            let description = type.replace(/_/g, " ");
            let actionAndTarget = message?.substring(user.length).trim();

            const colonIndex = actionAndTarget.indexOf(":");
            if (colonIndex !== -1) {
              description = actionAndTarget.substring(0, colonIndex).trim();
            }

            return {
              id: activity._id,
              user,
              action: description,
              task: activity.task,
              timestamp: activity.createdAt,
              messageType: type,
            };
          });
          setActivities(parsed);
        } else {
          const errorMsg = response.data?.message || "Failed to fetch activities.";
          setActivitiesError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        setActivitiesError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivitiesData();
  }, [isRefreshing]);

  return { activities, activitiesLoading, activitiesError };
};

export default useActivities;
