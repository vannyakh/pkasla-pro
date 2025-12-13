"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Save,
  Camera,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMe } from "@/hooks/api/useAuth";
import { useUpdateProfile } from "@/hooks/api/useUser";
import { api } from "@/lib/axios-client";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: user, isLoading: isLoadingUser } = useMe();
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatarFile: null as File | null,
  });

  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatarFile: null,
      });
      setAvatarPreview(user.avatar);
      setUploadedAvatarUrl(user.avatar);
    }
  }, [user]);

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Set file in form data
    setFormData((prev) => ({ ...prev, avatarFile: file }));
    setIsUploadingAvatar(true);
    setUploadProgress(0);

    // Upload file to server
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await api.upload<{
        id: string;
        url: string;
        key: string;
        provider: string;
        filename: string;
        mimetype: string;
        size: number;
        originalSize?: number;
        compressionRatio?: string;
        folder: string;
        createdAt: string;
      }>("/upload/avatar", uploadFormData, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success && response.data) {
        setUploadedAvatarUrl(response.data.url);
        setIsUploadingAvatar(false);
        setUploadProgress(100);
        toast.success("Avatar uploaded successfully!");
      } else {
        throw new Error(response.error || "Failed to upload avatar");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload avatar";
      setIsUploadingAvatar(false);
      setUploadProgress(0);
      setFormData((prev) => ({ ...prev, avatarFile: null }));
      setAvatarPreview(user?.avatar);
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if avatar is still uploading
    if (isUploadingAvatar) {
      toast.error("Please wait for avatar upload to complete");
      return;
    }

    try {
      // Only send fields that have values to avoid clearing existing data
      const updateData: {
        name?: string;
        phone?: string;
        avatar?: string;
      } = {};

      if (formData.name && formData.name.trim()) {
        updateData.name = formData.name.trim();
      }

      if (formData.phone && formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      } else if (formData.phone === "" && user?.phone) {
        // Only explicitly clear phone if user had one and intentionally cleared it
        // For now, don't send empty phone to preserve existing value
      }

      if (uploadedAvatarUrl && uploadedAvatarUrl !== user?.avatar) {
        updateData.avatar = uploadedAvatarUrl;
      }

      // Only make the request if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateProfile.mutateAsync(updateData);
      } else {
        toast.error("No changes to save");
      }
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className=" gap-6 max-w-2xl">
      <div>
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-24 w-24 mb-4 relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview} alt={user?.name} />
                <AvatarFallback className="bg-gray-200 text-black text-2xl font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="absolute right-0 bottom-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  type="button"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="text-white text-xs font-semibold">
                    {uploadProgress}%
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 h-11 text-sm border-gray-300"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-11 text-sm border-gray-300"
                    placeholder="Enter your email"
                    required
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 h-11 text-sm border-gray-300"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateProfile.isPending || isLoadingUser || isUploadingAvatar}
                className="w-full h-11 text-sm font-medium disabled:opacity-50"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isUploadingAvatar ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading Avatar...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
