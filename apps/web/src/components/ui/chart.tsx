"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

// Context et configuration chart
const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

interface ChartConfig {
  [k: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: Record<string, string>
  }
}

interface ChartContextProps {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}

function Chart({ config, children, ...props }: ChartContextProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <RechartsPrimitive.ResponsiveContainer {...props}>
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </ChartContext.Provider>
  )
}

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <Chart />")
  }

  return context
}

// Utility functions
const getPayloadConfigFromPayload = (
  config: ChartConfig,
  payload: any,
  key: string
) => {
  return config[key] || config[payload.dataKey] || config[payload.name]
}

// Chart Container
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border",
          "[&_.recharts-radial-bar-background-sector]:fill-muted",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted",
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-sector]:outline-none",
          "[&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

// Chart Style
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
:root {
  ${colorConfig
    .map(([key, itemConfig]) => {
      const color = itemConfig.color || itemConfig.theme?.light
      return color ? `--color-${key}: ${color};` : null
    })
    .join("")}
}
        `,
      }}
    />
  )
}

// Chart Tooltip
interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: any[]
  label?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  ChartTooltipProps
>(({ active, payload, label, hideLabel, hideIndicator, indicator = "dot", nameKey, labelKey, className, ...props }, ref) => {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item.dataKey || item.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value = itemConfig?.label || label

    return <div className="font-normal tracking-tight">{value}</div>
  }, [label, payload, hideLabel, config, labelKey])

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {tooltipLabel}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const indicatorColor = item.color

          return (
            <div
              key={item.dataKey}
              className="flex w-full flex-wrap items-stretch gap-2"
            >
              {!hideIndicator && (
                <div
                  className="shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                  style={{
                    backgroundColor: indicatorColor,
                    width: "8px",
                    height: "8px",
                  }}
                />
              )}
              <div className="flex flex-1 justify-between">
                <span className="text-muted-foreground">
                  {itemConfig?.label || item.name}
                </span>
                <span className="font-mono font-normal text-foreground tracking-tight">
                  {item.value}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltip.displayName = "ChartTooltip"

// Chart Legend
interface ChartLegendProps extends React.HTMLAttributes<HTMLDivElement> {
  nameKey?: string
  payload?: any[]
}

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  ChartLegendProps
>(({ className, nameKey, ...props }, ref) => {
  const { config } = useChart()

  const { payload: payloadProp, ...restProps } = props
  const payload = payloadProp || []

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", className)}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
          >
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: item.color,
              }}
            />
            <span className="text-muted-foreground">
              {itemConfig?.label || item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartStyle,
  useChart,
  type ChartConfig,
}