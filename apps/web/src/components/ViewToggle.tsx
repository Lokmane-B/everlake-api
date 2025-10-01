import { Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  view: "widget" | "list";
  onViewChange: (view: "widget" | "list") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange("widget")}
        className={`h-6 px-0 text-xs hover:bg-transparent focus-visible:ring-0 ${view === "widget" ? "text-foreground" : "text-muted-foreground"}`}
      >
        <Grid3X3 className="h-3 w-3 mr-1" />
        Widget
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange("list")}
        className={`h-6 px-0 text-xs hover:bg-transparent focus-visible:ring-0 ${view === "list" ? "text-foreground" : "text-muted-foreground"}`}
      >
        <List className="h-3 w-3 mr-1" />
        Liste
      </Button>
    </div>
  );
}