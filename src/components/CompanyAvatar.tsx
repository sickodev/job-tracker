"use client";

import React, { useState, useEffect } from "react";
import { getCompanyLogoUrl } from "@/lib/utils";

interface CompanyAvatarProps {
  company: string;
  companyUrl?: string;
  jobUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CONFIG = {
  xs: {
    container: "w-5 h-5 rounded text-[9px]",
    img: "w-3.5 h-3.5",
  },
  sm: {
    container: "w-6 h-6 rounded-md text-[10px]",
    img: "w-4 h-4",
  },
  md: {
    container: "w-8 h-8 rounded-lg text-xs",
    img: "w-5 h-5",
  },
  lg: {
    container: "w-10 h-10 rounded-lg text-sm",
    img: "w-6 h-6",
  },
  xl: {
    container: "w-12 h-12 rounded-xl text-base",
    img: "w-7 h-7",
  },
};

function CompanyAvatarComponent({
  company,
  companyUrl,
  jobUrl,
  size = "md",
  className = "",
}: CompanyAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const logoUrl = getCompanyLogoUrl(company, companyUrl, jobUrl);
  const initials = (company || "?").substring(0, 2).toUpperCase();
  const sizeStyles = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  // Reset error & loaded state if company or URLs change
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [company, companyUrl, jobUrl]);

  const showFallback = !logoUrl || imageError;

  if (showFallback) {
    return (
      <div
        className={`${sizeStyles.container} bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-medium uppercase shrink-0 select-none ${className}`}
        aria-label={`${company} logo`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`${sizeStyles.container} bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden select-none relative ${className}`}
      aria-label={`${company} logo`}
    >
      {!imageLoaded && (
        <span className="font-medium text-zinc-400 dark:text-zinc-500 uppercase text-[10px] animate-pulse">
          {initials}
        </span>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`${company} logo`}
        className={`${sizeStyles.img} object-contain transition-opacity duration-150 ${
          imageLoaded ? "opacity-100" : "opacity-0 absolute"
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
}

export const CompanyAvatar = React.memo(CompanyAvatarComponent);
