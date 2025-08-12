"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn("w-full", className)}>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </section>
  );
}
