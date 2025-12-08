"use client";

import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Image as ImageIcon, Sparkles, Search } from "lucide-react";
import { useQRCustomizationStore } from "@/store/qrCustomization";
import toast from "react-hot-toast";
import Image from "next/image";

// Background patterns/images library
const BACKGROUND_LIBRARY = [
  {
    id: "palm-leaves",
    name: "Palm Leaves",
    url: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=400&q=80",
    category: "nature",
  },
  {
    id: "floral-pattern",
    name: "Floral Pattern",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80",
    category: "pattern",
  },
  {
    id: "sky-clouds",
    name: "Sky Clouds",
    url: "https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=400&q=80",
    category: "nature",
  },
  {
    id: "green-grass",
    name: "Green Grass",
    url: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&q=80",
    category: "texture",
  },
  {
    id: "white-gradient",
    name: "White Gradient",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80",
    category: "gradient",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    url: "https://images.unsplash.com/photo-1579783483458-83d02161294e?w=400&q=80",
    category: "artistic",
  },
  {
    id: "wood-texture",
    name: "Wood Texture",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
    category: "texture",
  },
  {
    id: "flowers-border",
    name: "Flowers Border",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
    category: "pattern",
  },
  {
    id: "leaf-pattern",
    name: "Leaf Pattern",
    url: "https://images.unsplash.com/photo-1556514767-5c270b96a005?w=400&q=80",
    category: "nature",
  },
  {
    id: "black-solid",
    name: "Black",
    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23000000'/%3E%3C/svg%3E",
    category: "solid",
  },
  {
    id: "brush-strokes",
    name: "Brush Strokes",
    url: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&q=80",
    category: "artistic",
  },
  {
    id: "sunset-palm",
    name: "Sunset Palm",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    category: "nature",
  },
  {
    id: "space-nebula",
    name: "Space Nebula",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80",
    category: "abstract",
  },
  {
    id: "wildflowers",
    name: "Wildflowers",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80",
    category: "nature",
  },
  {
    id: "gold-glitter",
    name: "Gold Glitter",
    url: "https://images.unsplash.com/photo-1579783483458-83d02161294e?w=400&q=80",
    category: "texture",
  },
  {
    id: "bokeh-lights",
    name: "Bokeh Lights",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
    category: "abstract",
  },
  {
    id: "eucalyptus",
    name: "Eucalyptus",
    url: "https://images.unsplash.com/photo-1576620591244-1d295744501c?w=400&q=80",
    category: "nature",
  },
  {
    id: "monstera-leaves",
    name: "Monstera Leaves",
    url: "https://images.unsplash.com/photo-1538511656835-e950f8ec7dbd?w=400&q=80",
    category: "nature",
  },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "nature", label: "Nature", icon: ImageIcon },
  { id: "pattern", label: "Patterns", icon: ImageIcon },
  { id: "texture", label: "Textures", icon: ImageIcon },
  { id: "gradient", label: "Gradients", icon: ImageIcon },
  { id: "artistic", label: "Artistic", icon: ImageIcon },
  { id: "solid", label: "Solid", icon: ImageIcon },
];

interface MediaPanelProps {
  onImageSelect?: (imageUrl: string) => void;
}

export function MediaPanel({ onImageSelect }: MediaPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const setCustomization = useQRCustomizationStore((state) => state.setCustomization);
  const addElement = useQRCustomizationStore((state) => state.addElement);
  const elements = useQRCustomizationStore((state) => state.customization.elements);
  const backgroundColor = useQRCustomizationStore((state) => state.customization.backgroundColor);

  // Filter backgrounds based on search and category
  const filteredBackgrounds = BACKGROUND_LIBRARY.filter((bg) => {
    const matchesSearch = bg.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || bg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setUploadedImages((prev) => [imageUrl, ...prev]);
      toast.success("Image uploaded successfully!");
    };
    reader.onerror = () => {
      toast.error("Failed to upload image");
    };
    reader.readAsDataURL(file);
  };

  // Set as canvas background
  const handleSetAsBackground = (imageUrl: string) => {
    setCustomization({ backgroundColor: imageUrl });
    toast.success("Background updated!");
  };

  // Add as logo element
  const handleAddAsLogo = (imageUrl: string) => {
    const logoCount = elements.filter((el) => el.type === "logo").length;
    addElement({
      type: "logo",
      x: 50 + logoCount * 20,
      y: 50 + logoCount * 20,
      visible: true,
      locked: false,
      zIndex: elements.length + 1,
      imageUrl: imageUrl,
    });
    toast.success("Image added to canvas!");
    
    if (onImageSelect) {
      onImageSelect(imageUrl);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <Label className="text-sm font-semibold">Media & Backgrounds</Label>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search backgrounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Upload Button */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
          size="sm"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <div className="border-b">
          <TabsList className="w-full justify-start h-auto p-2 bg-transparent rounded-none overflow-x-auto flex-nowrap">
            {CATEGORIES.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs whitespace-nowrap data-[state=active]:bg-primary/10"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Uploaded Images Section */}
          {uploadedImages.length > 0 && (
            <div className="p-4 border-b">
              <Label className="text-xs font-medium text-gray-600 mb-2 block">
                Your Uploads
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {uploadedImages.map((imageUrl, index) => (
                  <BackgroundTile
                    key={`uploaded-${index}`}
                    imageUrl={imageUrl}
                    name={`Upload ${index + 1}`}
                    isSelected={backgroundColor === imageUrl}
                    onSetBackground={() => handleSetAsBackground(imageUrl)}
                    onAddAsElement={() => handleAddAsLogo(imageUrl)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Background Library */}
          <TabsContent value={selectedCategory} className="mt-0 p-4">
            {filteredBackgrounds.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No backgrounds found
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredBackgrounds.map((bg) => (
                  <BackgroundTile
                    key={bg.id}
                    imageUrl={bg.url}
                    name={bg.name}
                    isSelected={backgroundColor === bg.url}
                    onSetBackground={() => handleSetAsBackground(bg.url)}
                    onAddAsElement={() => handleAddAsLogo(bg.url)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

interface BackgroundTileProps {
  imageUrl: string;
  name: string;
  isSelected: boolean;
  onSetBackground: () => void;
  onAddAsElement: () => void;
}

function BackgroundTile({
  imageUrl,
  name,
  isSelected,
  onSetBackground,
  onAddAsElement,
}: BackgroundTileProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer"
      style={{ borderColor: isSelected ? "hsl(var(--primary))" : "#e5e7eb" }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Image */}
      <div className="relative w-full h-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 150px, 150px"
        />
      </div>

      {/* Overlay with actions */}
      {showActions && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 p-2">
          <Button
            size="sm"
            onClick={onSetBackground}
            className="w-full text-xs h-7"
          >
            Set Background
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onAddAsElement}
            className="w-full text-xs h-7 bg-white"
          >
            Add as Element
          </Button>
        </div>
      )}

      {/* Name label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-[10px] text-white font-medium truncate">{name}</p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
          <svg
            className="h-3 w-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

