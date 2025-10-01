import { Button, ButtonProps } from "@/components/ui/button";

export interface ControlButtonProps extends Omit<ButtonProps, 'size'> {}

export function ControlButton({ variant = "ghost", ...props }: ControlButtonProps) {
  return <Button variant={variant} size="control" {...props} />;
}