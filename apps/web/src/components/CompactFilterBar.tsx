import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useRef, useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
interface FilterOption {
  value: string;
  label: string;
}

interface CompactFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
}

export function CompactFilterBar({ searchTerm, onSearchChange, filters = [] }: CompactFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { state } = useSidebar();
  const dense = state === "collapsed";

  const handleSearchClick = () => {
    setIsExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputBlur = () => {
    if (!searchTerm) {
      setTimeout(() => {
        setIsExpanded(false);
      }, 150);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      setIsExpanded(true);
    }
  }, [searchTerm]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center">
        {!isExpanded ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearchClick}
            className={`${dense ? "h-7 w-7" : "h-8 w-8"} p-0 hover:bg-accent rounded-none`}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
        ) : (
          <div className="relative overflow-hidden">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <Input
              ref={inputRef}
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onBlur={handleInputBlur}
              className={`pl-10 ${dense ? "h-7" : "h-8"} border-none bg-transparent rounded-sm transition-all duration-500 ease-out animate-in slide-in-from-right-2 fade-in`}
              style={{ width: dense ? '560px' : '420px' }}
            />
          </div>
        )}
      </div>
      
      {filters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className={`${dense ? "h-7" : "h-8"} px-2 text-xs rounded-none`}>
              <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
              <span className="text-foreground">Filtres</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-2 bg-card border border-border shadow-lg" align="start">
            {filters.map((filter, index) => (
              <div key={index} className="px-2 py-1">
                <div className="text-[11px] font-medium text-muted-foreground mb-1 px-2 tracking-tight">{filter.label}</div>
                <div className="space-y-1">
                  <DropdownMenuItem
                    onClick={() => filter.onChange("all")}
                    className={`w-full justify-start h-8 px-2 text-xs font-normal tracking-tight hover:bg-muted ${filter.value === "all" ? "bg-accent" : ""}`}
                  >
                    Tous
                  </DropdownMenuItem>
                  {filter.options.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => filter.onChange(option.value)}
                      className={`w-full justify-start h-8 px-2 text-xs font-normal tracking-tight hover:bg-muted ${filter.value === option.value ? "bg-accent" : ""}`}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}