import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTo?: string;
  variant?: 'default' | 'minimal';
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, actionTo, variant = 'default' }: EmptyStateProps) {
  const cardClasses = variant === 'minimal' 
    ? "border-none shadow-none bg-transparent p-0 w-full" 
    : "border-dashed border-2 w-full";
  
  const contentClasses = variant === 'minimal'
    ? "flex flex-col items-center justify-center py-8 text-center"
    : "flex flex-col items-center justify-center py-12 text-center";

  return (
    <Card className={cardClasses}>
      <CardContent className={contentClasses}>
        <Icon className="h-6 w-6 text-muted-foreground mb-4" />
        <h3 className="text-xs font-normal mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md text-xs">{description}</p>
        {actionLabel && (actionTo || onAction) && (
          <Button 
            onClick={onAction} 
            size="xs" 
            className="mt-2"
            asChild={!!actionTo}
          >
            {actionTo ? (
              <Link to={actionTo}>{actionLabel}</Link>
            ) : (
              actionLabel
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}