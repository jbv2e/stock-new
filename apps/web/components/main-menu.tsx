"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { apiFetch, apiJson } from "@/lib/api";

export function MainMenu() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isActive = true;
    apiFetch("/auth/me", { method: "GET", cache: "no-store" })
      .then((res) => {
        if (isActive) {
          setIsAuthenticated(res.ok);
        }
      })
      .catch(() => {
        if (isActive) {
          setIsAuthenticated(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiJson<{ message: string }>("/auth/logout", { method: "POST" });
    } catch {
      // ignore errors and still redirect to login
    } finally {
      setIsAuthenticated(false);
      router.replace("/login");
      router.refresh();
    }
  }, [router]);

  return (
    <Menubar className="px-4 border-b h-12 flex items-center">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>?쁔</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Share</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>?쁛</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>?㎮뙓Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Reload</MenubarItem>
          <MenubarItem>Force Reload</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Toggle Fullscreen</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Hide Sidebar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      {isAuthenticated && (
        <Button
          className="ml-auto bg-green-600 hover:bg-[#22c55e] text-gray-100 hover:text-gray-100 hover:cursor-pointer"
          variant="ghost"
          onClick={handleLogout}
        >
          로그아웃
        </Button>
      )}
    </Menubar>
  );
}
