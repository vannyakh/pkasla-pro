"use client";

import {
  Calendar,
  Settings as SettingsIcon,
  FileText,
  Info,
  UserCheck,
  DollarSign,
  MoreHorizontal,
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type ValidTab =
  | "overview"
  | "guests"
  | "payments"
  | "schedule"
  | "templates"
  | "qr"
  | "settings"
  | "stores";

interface EventTabsNavigationProps {
  activeTab: ValidTab;
  onTabChange: (tab: ValidTab) => void;
  isTabsDrawerOpen: boolean;
  onTabsDrawerOpenChange: (open: boolean) => void;
}

export function EventTabsNavigation({
  activeTab,
  onTabChange,
  isTabsDrawerOpen,
  onTabsDrawerOpenChange,
}: EventTabsNavigationProps) {
  const isMoreTabActive =
    activeTab === "schedule" ||
    activeTab === "templates" ||
    activeTab === "stores" ||
    activeTab === "qr" ||
    activeTab === "settings";

  return (
    <div className="max-w-3xl mx-auto fixed bottom-4 left-4 right-4 z-50">
      <div className="backdrop-blur-xl rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800 shadow-lg">
        <TabsList className="grid grid-cols-5 w-full h-auto min-h-14 sm:h-16 gap-1 bg-transparent p-1.5">
          <TabsTrigger
            value="overview"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 h-full min-h-14 sm:min-h-0 px-2 py-2 sm:py-0 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted/50 transition-all duration-200"
          >
            <Info className="h-5 w-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium leading-tight">ទូទៅ</span>
          </TabsTrigger>
          <TabsTrigger
            value="guests"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 h-full min-h-14 sm:min-h-0 px-2 py-2 sm:py-0 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted/50 transition-all duration-200"
          >
            <UserCheck className="h-5 w-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium leading-tight">ភ្ញៀវ</span>
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 h-full min-h-14 sm:min-h-0 px-2 py-2 sm:py-0 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted/50 transition-all duration-200"
          >
            <DollarSign className="h-5 w-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium leading-tight">ប្រាក់</span>
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 h-full min-h-14 sm:min-h-0 px-2 py-2 sm:py-0 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted/50 transition-all duration-200"
          >
            <FileText className="h-5 w-5 shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium leading-tight">គំរូ</span>
          </TabsTrigger>
          <Drawer open={isTabsDrawerOpen} onOpenChange={onTabsDrawerOpenChange}>
            <DrawerTrigger asChild>
              <button
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 h-full min-h-14 sm:min-h-0 px-2 py-2 sm:py-0 rounded-xl transition-all duration-200 ${
                  isMoreTabActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <MoreHorizontal className="h-5 w-5 shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium leading-tight hidden sm:inline">ច្រើន</span>
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>ជ្រើសរើសផ្ទាំង</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 space-y-2">
                <button
                  onClick={() => {
                    onTabChange("schedule");
                    onTabsDrawerOpenChange(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    activeTab === "schedule"
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">កាលវិភាគ</span>
                </button>
                <button
                  onClick={() => {
                    onTabChange("templates");
                    onTabsDrawerOpenChange(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    activeTab === "templates"
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">គំរូធៀបខ្ញុំ</span>
                </button>
                <button
                  onClick={() => {
                    onTabChange("settings");
                    onTabsDrawerOpenChange(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    activeTab === "settings"
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <SettingsIcon className="h-5 w-5" />
                  <span className="text-sm">ការកំណត់</span>
                </button>
              </div>
            </DrawerContent>
          </Drawer>
        </TabsList>
      </div>
    </div>
  );
}

