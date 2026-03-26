import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUserStore } from "@/store/useStore";

export function UsersPage() {
  const { allUsers, fetchUsers, loading, updateSingleUser } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    address_line_1: "",
    address_street: "",
    address_barangay: "",
    address_zip_code: "",
    address_city: "",
    address_province: "",
    role: "",
    phone: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  const filteredUsers = useMemo(() => {
    return allUsers.filter(
      (user) =>
        user?.first_name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        user?.last_name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        user?.middle_name?.toLowerCase().includes(searchQuery?.toLowerCase()),
    );
  }, [allUsers, searchQuery]);

  const handleOpenDialog = (user) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        address_line_1: "",
        address_street: "",
        address_barangay: "",
        address_zip_code: "",
        address_city: "",
        address_province: "",
        role: "",
        phone: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingUser) {
      console.log("submitted", editingUser, formData);
      updateSingleUser(formData);

      toast.success("User updated successfully");
    } else {
      //addUser(formData);
      toast.success("User added successfully");
    }

    handleCloseDialog();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage members, staff, and administrators
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No users found" : "No users yet"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Coop Status</TableHead>

                    <TableHead>birthdate</TableHead>

                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{`${user?.first_name || ""} ${user.middle_name || ""} ${user.last_name || ""}`}</TableCell>
                      <TableCell>{`${user?.address_line_1 || ""} ${user.address_street || ""} ${user.address_barangay || ""} ${user.address_zip_code || ""} ${user.address_city || ""} ${user.address_province || ""}`}</TableCell>
                      <TableCell>{user.phone || ""}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                              : user.role === "staff"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user?.coop_status === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                              : user?.coop_status === "staff"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          }`}
                        >
                          {user?.coop_status}
                        </span>
                      </TableCell>
                      <TableCell>{user?.birthdate}</TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        className="w-full max-w-[90%]"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update user information"
                : "Add a new user to the system"}
            </DialogDescription>
          </DialogHeader>
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
                  value={formData.first_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
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
                  value={formData.middle_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, middle_name: e.target.value })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
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
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
                  } transition-all`}
                  placeholder="Enter last name"
                />
              </div>

              {/* Coop Status */}
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-semibold text-gray-700"
                >
                  Status <span className="text-red-500">*</span>
                </Label>

                <Select
                  id="status"
                  value={formData.coop_status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, coop_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="inactive">inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Birthdate */}
              <div className="space-y-2">
                <Label
                  htmlFor="birthdate"
                  className="text-sm font-semibold text-gray-700"
                >
                  Birthdate<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, birthdate: e.target.value })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
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
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
                  } transition-all`}
                  placeholder="Enter phone"
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
                  value={formData.tin || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tin: e.target.value })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
                  } transition-all`}
                  placeholder="Enter TIN"
                />
              </div>

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
                  value={formData.address_line_1 || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line_1: e.target.value })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
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
                  value={formData.address_street || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address_street: e.target.value })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
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
                  value={formData.address_barangay || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address_barangay: e.target.value,
                    })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
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
                  value={formData.address_city || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address_city: e.target.value,
                    })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
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
                  value={formData.address_province || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address_province: e.target.value,
                    })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
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
                  value={formData.address_zip_code || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address_zip_code: e.target.value,
                    })
                  }
                  disabled={!editingUser}
                  className={`${
                    !editingUser ? "bg-gray-50 cursor-not-allowed" : ""
                  } transition-all`}
                  placeholder="e.g "
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
              <Button
                onClick={handleSubmit}
                className="flex-1 sm:flex-none gap-2"
                size="lg"
              >
                <Save size={18} />
                Save Changes
              </Button>
              <Button
                onClick={handleCloseDialog}
                variant="outline"
                className="flex-1 sm:flex-none gap-2"
                size="lg"
              >
                <X size={18} />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
