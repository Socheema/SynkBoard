"use client";

import { UserButton } from "@clerk/nextjs";
import { useThemeStore } from "@/lib/store/themeStore";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";

export default function DashboardLayout({ children }) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left: Logo + Workspace Switcher */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              🚀 SynkBoard
            </h1>
            <WorkspaceSwitcher />
          </div>

          {/* Right: Theme Toggle + User */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
