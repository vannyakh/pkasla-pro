"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Template, TemplateFormData } from "@/types/template";
import { useTemplateCategories } from "@/hooks/api/useTemplate";

interface TemplateFormProps {
  template?: Template;
  onSubmit: (data: TemplateFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function TemplateForm({
  template,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TemplateFormProps) {
  const { data: categories = [], isLoading: categoriesLoading } =
    useTemplateCategories();
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    title: "",
    category: "",
    price: "",
    isPremium: false,
    previewImage: null,
    slug: "",
    status: "draft",
    variables: [],
    assets: {
      images: [],
      colors: [],
      fonts: [],
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (template) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setFormData(() => ({
        name: template.name,
        title: template.title,
        category: template.category ?? "",
        price: template.price ?? "",
        isPremium: template.isPremium,
        previewImage: template.previewImage ?? null,
        slug: template.slug ?? "",
        status:
          (template.status as "draft" | "published" | "archived") ?? "draft",
        variables: template.variables ?? [],
        assets: template.assets ?? {
          images: [],
          colors: [],
          fonts: [],
        },
      }));
    }
  }, [template]);

  const handleInputChange = (
    field: keyof TemplateFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (url: string | null) => {
    setFormData((prev) => ({ ...prev, previewImage: url }));
    // Clear errors when image is successfully uploaded
    if (url) {
      setErrors((prev) => ({ ...prev, previewImage: "" }));
    }
  };

  const handleImageError = (error: string) => {
    setErrors((prev) => ({ ...prev, previewImage: error }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (
      formData.price !== "" &&
      (isNaN(Number(formData.price)) || Number(formData.price) < 0)
    ) {
      newErrors.price = "Price must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Pass formData - previewImage is already set to the uploaded URL
    await onSubmit({
      ...formData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <Label
          htmlFor="name"
          className="text-sm font-semibold text-black mb-2 block"
        >
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="e.g., wedding-template-01"
          className="h-10 text-sm"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <Label
          htmlFor="title"
          className="text-sm font-semibold text-black mb-2 block"
        >
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="e.g., Elegant Wedding Invitation"
          className="h-10 text-sm"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-xs text-red-600 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <Label
          htmlFor="category"
          className="text-sm font-semibold text-black mb-2 block"
        >
          Category
        </Label>
        <NativeSelect
          id="category"
          value={formData.category || ""}
          onChange={(e) => handleInputChange("category", e.target.value)}
          disabled={isSubmitting || categoriesLoading}
          className="h-10 text-sm w-full"
        >
          <NativeSelectOption value="">
            {categoriesLoading
              ? "Loading categories..."
              : "Select a category"}
          </NativeSelectOption>
          {categories.length > 0 ? (
            <>
              {categories.map((category) => (
                <NativeSelectOption key={category} value={category}>
                  {category}
                </NativeSelectOption>
              ))}
              {/* Show current category if it's not in the list (for backward compatibility) */}
              {formData.category &&
                !categories.includes(formData.category) && (
                  <NativeSelectOption
                    key={formData.category}
                    value={formData.category}
                  >
                    {formData.category}
                  </NativeSelectOption>
                )}
            </>
          ) : (
            <>
              {formData.category && (
                <NativeSelectOption value={formData.category}>
                  {formData.category}
                </NativeSelectOption>
              )}
            </>
          )}
        </NativeSelect>
        {!categoriesLoading && categories.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            No categories available
          </p>
        )}
      </div>

      {/* Price */}
      <div>
        <Label
          htmlFor="price"
          className="text-sm font-semibold text-black mb-2 block"
        >
          Price
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) =>
            handleInputChange(
              "price",
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
          placeholder="0.00"
          className="h-10 text-sm"
          disabled={isSubmitting}
        />
        {errors.price && (
          <p className="text-xs text-red-600 mt-1">{errors.price}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <Label
          htmlFor="slug"
          className="text-sm font-semibold text-black mb-2 block"
        >
          Slug (Route Name)
        </Label>
        <Input
          id="slug"
          value={formData.slug ?? ""}
          onChange={(e) => handleInputChange("slug", e.target.value)}
          placeholder="e.g., classic-gold, modern-minimal"
          className="h-10 text-sm"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          Unique identifier for the template route (lowercase, hyphens only)
        </p>
      </div>

      {/* Variables */}
      <div>
        <Label
          htmlFor="variables"
          className="text-sm font-semibold text-black mb-2 block"
        >
          Available Variables (comma-separated)
        </Label>
        <Input
          id="variables"
          value={formData.variables?.join(", ") ?? ""}
          onChange={(e) => {
            const vars = e.target.value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean);
            setFormData((prev) => ({ ...prev, variables: vars }));
          }}
          placeholder="e.g., event.title, guest.name, event.date"
          className="h-10 text-sm"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          List of variables that can be used in this template
        </p>
      </div>

      {/* Status */}
      <div>
        <Label
          htmlFor="status"
          className="text-sm font-semibold text-black mb-2 block"
        >
          Status <span className="text-red-500">*</span>
        </Label>
        <NativeSelect
          id="status"
          value={formData.status}
          onChange={(e) =>
            handleInputChange(
              "status",
              e.target.value as "draft" | "published" | "archived"
            )
          }
          disabled={isSubmitting}
          className="h-10 text-sm w-full"
        >
          <NativeSelectOption value="draft">Draft</NativeSelectOption>
          <NativeSelectOption value="published">Published</NativeSelectOption>
          <NativeSelectOption value="archived">Archived</NativeSelectOption>
        </NativeSelect>
        <p className="text-xs text-gray-500 mt-1">
          Published templates are visible to all users. Draft and archived
          templates are only visible to admins.
        </p>
      </div>

      {/* Is Premium */}
      <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <Checkbox
          id="isPremium"
          checked={formData.isPremium}
          onCheckedChange={(checked) =>
            handleInputChange("isPremium", checked as boolean)
          }
          disabled={isSubmitting}
        />
        <Label
          htmlFor="isPremium"
          className="text-sm font-medium text-black cursor-pointer"
        >
          Premium Template
        </Label>
      </div>

      {/* Preview Image */}
      <ImageUpload
        value={formData.previewImage as string | null}
        onChange={handleImageChange}
        onError={handleImageError}
        folder="templates"
        disabled={isSubmitting}
        label="Preview Image"
        id="previewImage"
        maxSize={5}
      />
      {errors.previewImage && (
        <p className="text-xs text-red-600 mt-1">{errors.previewImage}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="h-10">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {template ? "Updating..." : "Creating..."}
            </>
          ) : template ? (
            "Update Template"
          ) : (
            "Create Template"
          )}
        </Button>
      </div>
    </form>
  );
}
