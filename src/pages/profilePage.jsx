import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { Edit, Save, X } from "lucide-react";
import { useAuthStore } from "@/store/useStore";

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(user);

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(user);
  };

  const handleSave = async () => {
    // Validation
    if (
      !editedProfile?.first_name ||
      !editedProfile?.last_name ||
      !editedProfile?.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Save changes
    setProfile(editedProfile);
    const { res } = await updateUser(editedProfile);

    setIsEditing(false);
    if (res?.error) {
      toast.error(res?.error?.message);
    } else {
      toast.success("Profile updated successfully!");
    }
  };

  const handleInputChange = (field, value) => {
    // let newValue = value;

    // if (field === "zipCode") {
    //   console.log;
    //   formatZipCode(value);
    // }
    // if (field === "tin") newValue = formatTin(value);
    // if (field === "phone") newValue = formatPhone(value);

    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <CardHeader className="">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:text-left flex-1">
            <CardTitle className="text-3xl font-bold text-gray-800">
              User Profile
            </CardTitle>
            <p className="text-gray-500 mt-1">
              Manage your personal information
            </p>
          </div>
          {!isEditing && profile?.role === "admin" && (
            <Button onClick={handleEdit} className="gap-2" size="lg">
              <Edit size={18} />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>

      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-sm font-semibold text-gray-700"
            >
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={editedProfile?.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="Enter first name"
            />
          </div>

          {/* Middle Name */}
          <div className="space-y-2">
            <Label
              htmlFor="middleName"
              className="text-sm font-semibold text-gray-700"
            >
              Middle Name
            </Label>
            <Input
              id="middleName"
              value={editedProfile?.middle_name}
              onChange={(e) => handleInputChange("middle_name", e.target.value)}
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="Enter middle name"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-sm font-semibold text-gray-700"
            >
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={editedProfile?.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="Enter last name"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="birthdate"
              className="text-sm font-semibold text-gray-700"
            >
              birthdate <span className="text-red-500">*</span>
            </Label>
            <Input
              id="birthdate"
              type="date"
              value={editedProfile?.birthdate}
              onChange={(e) => handleInputChange("birthdate", e.target.value)}
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="Enter last name"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-semibold text-gray-700"
            >
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              value={editedProfile?.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="Enter phone number"
            />
          </div>

          {/* TIN */}
          <div className="space-y-2">
            <Label
              htmlFor="tin"
              className="text-sm font-semibold text-gray-700"
            >
              TIN
            </Label>
            <Input
              id="tin"
              value={editedProfile?.tin}
              onChange={(e) => handleInputChange("tin", e.target.value)}
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="Enter TIN"
            />
          </div>

          {/* Role */}
          {/* <div className="space-y-2">
            <Label
              htmlFor="role"
              className="text-sm font-semibold text-gray-700"
            >
              Role
            </Label>
            <Select
              value={editedProfile?.role}
              onValueChange={(value) => handleInputChange("role", value)}
              disabled={!isEditing}
            >
              <SelectTrigger
                className={`${
                  !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                } transition-all`}
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          {/* address line 1 */}

          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-sm font-semibold text-gray-700"
            >
              House#, block, lot, apt, suite, unit, building, floor, etc
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              value={editedProfile?.address_line_1}
              onChange={(e) =>
                handleInputChange("address_line_1", e.target.value)
              }
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="e.g "
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="street"
              className="text-sm font-semibold text-gray-700"
            >
              Street address, village, etc
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              value={editedProfile?.address_street}
              onChange={(e) =>
                handleInputChange("address_street", e.target.value)
              }
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="e.g "
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="barangay"
              className="text-sm font-semibold text-gray-700"
            >
              Barangay
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="barangay"
              value={editedProfile?.address_barangay}
              onChange={(e) =>
                handleInputChange("address_barangay", e.target.value)
              }
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="e.g "
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="city"
              className="text-sm font-semibold text-gray-700"
            >
              City/Municipality
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              value={editedProfile?.address_city}
              onChange={(e) =>
                handleInputChange("address_city", e.target.value)
              }
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="e.g "
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="province"
              className="text-sm font-semibold text-gray-700"
            >
              Province
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="province"
              value={editedProfile?.address_province}
              onChange={(e) =>
                handleInputChange("address_province", e.target.value)
              }
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="e.g "
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="zip-code"
              className="text-sm font-semibold text-gray-700"
            >
              Zip code
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tin"
              value={editedProfile?.address_zip_code}
              onChange={(e) =>
                handleInputChange("address_zip_code", e.target.value)
              }
              disabled={!isEditing}
              className={`${
                !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
              } transition-all`}
              placeholder="e.g "
            />
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
            <Button
              onClick={handleSave}
              className="flex-1 sm:flex-none gap-2"
              size="lg"
            >
              <Save size={18} />
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 sm:flex-none gap-2"
              size="lg"
            >
              <X size={18} />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
