import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-center rounded-md bg-[rgba(255,255,255,0.02)] p-1 border border-[rgba(255,255,255,0.05)]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium font-inter text-[#B6B6B6] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11011E] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[rgba(255,255,255,0.05)] data-[state=active]:text-[#ECF1F0] hover:bg-[rgba(255,255,255,0.03)]",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 text-[#B6B6B6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0FAE96] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11011E]",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }