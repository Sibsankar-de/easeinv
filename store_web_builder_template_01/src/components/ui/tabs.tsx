"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const TabsListContext = React.createContext<{ variant?: "default" | "line" }>({
  variant: "default",
})

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex items-center text-muted-foreground",
  {
    variants: {
      variant: {
        default:
          "h-9 w-fit justify-center rounded-lg bg-muted p-1 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
        line:
          "h-auto w-full justify-start rounded-none border-b border-border/70 bg-transparent p-0 gap-6 sm:gap-8",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsListContext.Provider value={{ variant: variant ?? "default" }}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    </TabsListContext.Provider>
  )
}

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "rounded-md px-3 py-1 text-foreground/60 hover:text-foreground data-active:bg-background data-active:text-foreground data-active:shadow-xs",
        line:
          "relative rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-1 text-muted-foreground hover:text-foreground data-active:border-foreground data-active:text-foreground data-active:font-semibold -mb-px",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsTrigger({
  className,
  variant: triggerVariant,
  ...props
}: TabsPrimitive.Tab.Props & VariantProps<typeof tabsTriggerVariants>) {
  const { variant: listVariant } = React.useContext(TabsListContext)
  const variant = triggerVariant ?? listVariant ?? "default"

  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      data-variant={variant}
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none pt-2", className)}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
}
