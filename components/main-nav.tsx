"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Shield,
  Menu,
  LayoutDashboard,
  Users,
  Key,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

interface MainNavProps {
  isAuthenticated: boolean;
}

export function MainNav({ isAuthenticated }: MainNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine where the logo should link to based on authentication status
  const logoLink = isAuthenticated ? "/dashboard" : "/";

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard",
      protected: true,
    },
    {
      href: "/dashboard/clients",
      label: "Clients",
      icon: <Users className="h-4 w-4 mr-2" />,
      active:
        pathname === "/dashboard/clients" ||
        pathname.startsWith("/dashboard/clients/"),
      protected: true,
    },
    {
      href: "/dashboard/tokens",
      label: "Tokens",
      icon: <Key className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/tokens",
      protected: true,
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: <UserCircle className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/profile",
      protected: true,
    },
  ];

  return (
    <div className="mr-4 flex items-center">
      <Link href={logoLink} className="mr-6 flex items-center space-x-2">
        <Shield className="h-6 w-6 text-emerald-600" />
        <span className="hidden font-bold sm:inline-block">
          VeriGate<span className="text-xs align-top">™</span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        {routes.map((route) => {
          if (route.protected && !isAuthenticated) return null;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                route.active
                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-50"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {route.icon}
              {route.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex items-center mb-6">
              <Shield className="h-6 w-6 text-emerald-600 mr-2" />
              <span className="font-bold text-lg">
                VeriGate<span className="text-xs align-top">™</span>
              </span>
            </div>
            <nav className="flex flex-col space-y-1">
              {routes.map((route) => {
                if (route.protected && !isAuthenticated) return null;

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      route.active
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-50"
                        : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {route.icon}
                    {route.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
