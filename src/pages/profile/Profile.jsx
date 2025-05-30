"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar"; // Assuming shadcn/ui avatar is available
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Edit,
  Save,
  X,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ROUTES } from "@/constants/routes";

const Profile = () => {
  const { currentUser, updateUser } = useAuth(); // Assuming updateUser exists in AuthContext
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullname: currentUser?.fullname || "",
    email: currentUser?.email || "",
    whatsappNumber: currentUser?.whatsappNumber || "", // Assuming it comes from API or can be updated
    designation: currentUser?.designation || "",
    department: currentUser?.department || "",
    location: currentUser?.location || "",
    joinDate: currentUser?.joinDate
      ? new Date(currentUser.joinDate).toISOString().split("T")[0]
      : "", // Format for input type date
    bio: currentUser?.bio || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Basic validation example (can be expanded)
    if (!profileData.fullname.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }
    try {
      // Simulate API call to update profile
      // In a real app, you would call something like:
      // const updatedUser = await userApi.updateUserProfile(profileData);
      // And then update the context:
      // updateUser(updatedUser.data); // Assuming updateUser in AuthContext updates localStorage and state

      // For now, just update context locally if updateUser supports it
      if (updateUser) {
        updateUser(profileData); // This should ideally persist to backend and then update context
      }
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setProfileData({
      // Reset to original currentUser data
      fullname: currentUser?.fullname || "",
      email: currentUser?.email || "",
      whatsappNumber: currentUser?.whatsappNumber || "",
      designation: currentUser?.designation || "",
      department: currentUser?.department || "",
      location: currentUser?.location || "",
      joinDate: currentUser?.joinDate
        ? new Date(currentUser.joinDate).toISOString().split("T")[0]
        : "",
      bio: currentUser?.bio || "",
    });
    setIsEditing(false);
  };

  const getUserInitial = () => {
    return (
      profileData.fullname?.charAt(0).toUpperCase() ||
      currentUser?.name?.charAt(0).toUpperCase() ||
      "U"
    );
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your personal information and settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4 text-3xl font-medium">
                <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {getUserInitial()}
                </div>
                {/* <AvatarImage src={currentUser.avatarUrl || `https://avatar.vercel.sh/${currentUser.email}.png`} alt={profileData.fullname} />
              <AvatarFallback>{getUserInitial()}</AvatarFallback> */}
              </Avatar>
              <h2 className="text-xl font-semibold">
                {profileData.fullname || "User"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {profileData.designation || "No designation"}
              </p>
              <p className="text-sm text-gray-500">
                {profileData.department || "No department"}
              </p>

              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{profileData.email}</span>
                </div>
                {profileData.whatsappNumber && (
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    {profileData.whatsappNumber}
                  </div>
                )}
                {profileData.location && (
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    {profileData.location}
                  </div>
                )}
              </div>

              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 w-full"
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Details & Security */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <CardHeader className="border-b">
              <div className="flex flex-row items-center justify-between">
                <TabsList className="grid grid-cols-2 w-auto">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="work">Work Info</TabsTrigger>
                </TabsList>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} size="sm" variant="outline">
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="personal" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      name="fullname"
                      value={profileData.fullname}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                    <Input
                      id="whatsappNumber"
                      name="whatsappNumber"
                      type="tel"
                      value={profileData.whatsappNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 w-full min-h-[100px] px-3 py-2 border border-input rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="work" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      name="designation"
                      value={profileData.designation}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={profileData.department}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="e.g., Engineering"
                    />
                  </div>
                  <div>
                    <Label htmlFor="joinDate">Join Date</Label>
                    <Input
                      id="joinDate"
                      name="joinDate"
                      type="date"
                      value={profileData.joinDate}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Security Settings Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-green-600" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.PROFILE_CHANGE_PASSWORD)}
          >
            <KeyRound className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Additional Info Cards - can be kept or removed based on preference */}
      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Account Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-blue-600">
              {currentUser?.accountType || currentUser?.role || "User"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Member Since
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-gray-700">
              {profileData.joinDate
                ? new Date(profileData.joinDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : currentUser?.createdAt
                ? new Date(currentUser.createdAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-green-600">Active</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
