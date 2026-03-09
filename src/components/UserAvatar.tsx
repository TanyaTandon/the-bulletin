import React from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  firstName: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-20 w-20 text-3xl",
};

const UserAvatar: React.FC<UserAvatarProps> = ({ firstName, className, size = "md" }) => {
  const initial = firstName?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={cn(
        "rounded-full bg-violet-500 text-white flex items-center justify-center font-medium select-none shrink-0 pt-[2px]",
        sizeClasses[size],
        className
      )}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
