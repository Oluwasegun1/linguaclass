"use client";

import * as React from "react";

interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({
  completed,
  total,
  size = 48,
  strokeWidth = 4.5,
  className = "",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Clamped ratio between 0 and 1
  const ratio = total > 0 ? Math.min(Math.max(completed / total, 0), 1) : 0;
  const strokeDashoffset = circumference - ratio * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      title={`${completed} of ${total} lessons completed`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
          fill="transparent"
        />
        {/* Active Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-teal transition-all duration-500 ease-out"
          fill="transparent"
        />
      </svg>
      {/* Center visual accent */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="size-1.5 rounded-full bg-teal" />
      </div>
    </div>
  );
}
