import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";


interface AppHeaderProps {
  hasNotifications?: boolean;
}

export function AppHeader({ hasNotifications = true }: AppHeaderProps) {
  return (
    <header className="h-12 flex items-center justify-between bg-background px-4">
      <SidebarTrigger />
    </header>
  );
}