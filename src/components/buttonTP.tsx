
import React from "react";
import { Button as ShadcnButton } from "./ui/button";

interface ButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  label,
  className,
  onClick,
  disabled,
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
