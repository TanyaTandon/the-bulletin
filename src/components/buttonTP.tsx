
import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";

interface ButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  className = "",
  disabled = false,
  children,
}) => {
  return (
    <ShadcnButton
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {label || children}
    </ShadcnButton>
  );
};

export default Button;
