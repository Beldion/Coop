import UserProfileForm from "@/components/userProfileForm";
import UsersDirectory from "@/components/usersDirectory";
import { useState } from "react";
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
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useFetchAllUsers, useUpdateUsers } from "@/api/users";
import { TableSkeleton } from "@/components/TableSkeleton";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function UsersPage() {
  const { data: users, isLoading, isError } = useFetchAllUsers();
  const updateSingleUser = useUpdateUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saveConfirm, setSaveConfirm] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingUser) {
      console.log("submitted", editingUser, formData);
      const res = await updateSingleUser.mutateAsync(formData);
      console.log("dasda", res);
      if (res.isError) {
        toast.error(res.isError);
      }
      toast.success("User updated successfully");
    }

    handleCloseDialog();
    setSaveConfirm(false);
  };

  if (isLoading) return <TableSkeleton />;
  if (isError) return <p>Something went wrong.</p>;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage members, staff, and administrators
          </p>
        </div>
      </div>

      <UsersDirectory users={users} onEdit={handleOpenDialog} />

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        className="w-full max-w-[90%]"
      >
        <DialogContent className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-2xl p-0 md:max-w-3xl">
          <UserProfileForm
            data={formData}
            editing={Boolean(editingUser)}
            setData={setFormData}
            onCancel={handleCloseDialog}
            onSave={() => setSaveConfirm(true)}
            pending={updateSingleUser.isPending}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={saveConfirm} onOpenChange={setSaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Save?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              disabled={updateSingleUser.isPending}
              onClick={handleSubmit}
              className="grey:bg-green-600 bg-green-500 hover:bg-green-600 focus:ring-green-600"
            >
              {updateSingleUser.isPending ? "Saving..." : "Yes"}
            </AlertDialogAction>
            <AlertDialogCancel>No</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
