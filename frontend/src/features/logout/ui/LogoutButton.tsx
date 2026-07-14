"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/shared/ui";
import { useLogout } from "../model/use-logout";

export function LogoutButton() {
  const logout = useLogout();
  return (
    <Button aria-label="Выйти" onClick={logout} size="small" variant="ghost">
      <LogOut aria-hidden size={18} />
    </Button>
  );
}
