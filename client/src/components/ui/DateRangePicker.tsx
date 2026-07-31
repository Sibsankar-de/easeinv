"use client";

import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Calendar,
} from "lucide-react";
import { cn } from "@/components/utils";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { AnalyticsFilterState, AnalyticsPeriod } from "@/types/AnalyticsTypes";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function startDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateShort(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysDifference(startStr: string, endStr: string): number {
  const s = parseDate(startStr);
  const e = parseDate(endStr);
  const diffTime = Math.abs(e.getTime() - s.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// ─── Presets ──────────────────────────────────────────────────────────────────
interface PresetOption {
  label: string;
  key: string;
  getRange: () => { start: string; end: string };
}

const PRESETS: PresetOption[] = [
  {
    label: "Today",
    key: "today",
    getRange: () => {
      const t = toDateStr(new Date());
      return { start: t, end: t };
    },
  },
  {
    label: "Yesterday",
    key: "yesterday",
    getRange: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const t = toDateStr(d);
      return { start: t, end: t };
    },
  },
  {
    label: "Last 7 Days",
    key: "7days",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return { start: toDateStr(start), end: toDateStr(end) };
    },
  },
  {
    label: "Last 30 Days",
    key: "30days",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return { start: toDateStr(start), end: toDateStr(end) };
    },
  },
  {
    label: "This Month",
    key: "thisMonth",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toDateStr(start), end: toDateStr(now) };
    },
  },
  {
    label: "Last Month",
    key: "lastMonth",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: toDateStr(start), end: toDateStr(end) };
    },
  },
];

// ─── Mini Calendar Component ──────────────────────────────────────────────────
interface MiniCalendarProps {
  year: number;
  month: number;
  selectedStart?: string;
  selectedEnd?: string;
  hovered?: string;
  onDayClick: (dateStr: string) => void;
  onDayHover: (dateStr?: string) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

const MiniCalendar = ({
  year,
  month,
  selectedStart,
  selectedEnd,
  hovered,
  onDayClick,
  onDayHover,
  onPrevMonth,
  onNextMonth,
}: MiniCalendarProps) => {
  const days = daysInMonth(year, month);
  const startDay = startDayOfMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  const todayStr = toDateStr(new Date());
  const effectiveEnd =
    selectedEnd ?? (selectedStart && hovered ? hovered : undefined);

  return (
    <div className="select-none w-full min-w-[250px] sm:min-w-[260px]">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        {onPrevMonth ? (
          <button
            type="button"
            onClick={onPrevMonth}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-7" />
        )}
        <span className="text-sm font-semibold text-foreground tracking-tight">
          {MONTHS[month]} {year}
        </span>
        {onNextMonth ? (
          <button
            type="button"
            onClick={onNextMonth}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-7" />
        )}
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 mb-1 text-center">
        {DAYS.map((d) => (
          <div
            key={d}
            className="h-8 flex items-center justify-center text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div
        className="grid grid-cols-7 gap-y-1 text-center"
        onMouseLeave={() => onDayHover(undefined)}
      >
        {cells.map((day, idx) => {
          if (day === null) return <div key={`blank-${idx}`} className="h-9" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;

          const isStart = dateStr === selectedStart;
          const isEnd = dateStr === effectiveEnd;

          let inRange = false;
          if (selectedStart && effectiveEnd) {
            const lo =
              selectedStart < effectiveEnd ? selectedStart : effectiveEnd;
            const hi =
              selectedStart < effectiveEnd ? effectiveEnd : selectedStart;
            inRange = dateStr > lo && dateStr < hi;
          }

          return (
            <div
              key={dateStr}
              className="relative h-9 flex items-center justify-center p-0"
            >
              {/* Continuous range highlight background band */}
              {inRange && (
                <div className="absolute inset-y-1 inset-x-0 bg-primary/15" />
              )}
              {isStart && effectiveEnd && selectedStart !== effectiveEnd && (
                <div className="absolute inset-y-1 right-0 w-1/2 bg-primary/15" />
              )}
              {isEnd && selectedStart && selectedStart !== effectiveEnd && (
                <div className="absolute inset-y-1 left-0 w-1/2 bg-primary/15" />
              )}

              <button
                type="button"
                disabled={isFuture}
                onClick={() => onDayClick(dateStr)}
                onMouseEnter={() => onDayHover(dateStr)}
                className={cn(
                  "relative z-10 h-8 w-8 rounded-full text-xs font-medium transition-all flex items-center justify-center cursor-pointer",
                  isFuture &&
                    "cursor-not-allowed opacity-30 text-muted-foreground",
                  !isFuture &&
                    !isStart &&
                    !isEnd &&
                    "hover:bg-accent hover:text-foreground text-foreground",
                  isToday &&
                    !isStart &&
                    !isEnd &&
                    "font-bold text-primary ring-1 ring-primary/40",
                  (isStart || isEnd) &&
                    "bg-primary text-primary-foreground font-semibold shadow-sm hover:brightness-110 scale-105",
                )}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Period Tabs Options ──────────────────────────────────────────────────────
const PERIOD_OPTIONS: { label: string; value: AnalyticsPeriod }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
interface DateRangePickerProps {
  value: AnalyticsFilterState;
  onChange: (value: AnalyticsFilterState) => void;
  className?: string;
  disabled?: boolean;
}

export const DateRangePicker = ({
  value,
  onChange,
  className,
  disabled,
}: DateRangePickerProps) => {
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hovered, setHovered] = useState<string | undefined>(undefined);
  const [selecting, setSelecting] = useState<"start" | "end">("start");

  const [direction, setDirection] = useState<"top" | "bottom">("bottom");
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

  const [draft, setDraft] = useState<{ start?: string; end?: string }>({
    start: value.startDate,
    end: value.endDate,
  });

  const now = new Date();
  const [navYear, setNavYear] = useState(now.getFullYear());
  const [navMonth, setNavMonth] = useState(now.getMonth());

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setDirection("bottom");
        setMaxHeight(undefined);
      }, 0);
      return;
    }

    const updateLayout = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const TOP_NAV_THRESHOLD = 60;
      const DROPDOWN_MARGIN = 8;

      const spaceBelow = viewportHeight - rect.bottom - DROPDOWN_MARGIN - 12;
      const spaceAbove = rect.top - TOP_NAV_THRESHOLD - DROPDOWN_MARGIN;

      const configuredMaxHeight = 520;

      const targetDirection =
        spaceBelow < configuredMaxHeight && spaceAbove > spaceBelow
          ? "top"
          : "bottom";

      const availableSpace =
        targetDirection === "top" ? spaceAbove : spaceBelow;

      const effectiveMaxHeight = Math.min(
        configuredMaxHeight,
        Math.max(200, Math.floor(availableSpace)),
      );

      setDirection(targetDirection);
      setMaxHeight(effectiveMaxHeight);
    };

    updateLayout();

    window.addEventListener("resize", updateLayout);
    window.addEventListener("scroll", updateLayout, true);

    return () => {
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("scroll", updateLayout, true);
    };
  }, [open]);

  // Second month is navMonth + 1
  const secondMonth = navMonth === 11 ? 0 : navMonth + 1;
  const secondYear = navMonth === 11 ? navYear + 1 : navYear;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync draft when popover opens
  useEffect(() => {
    if (open) {
      setDraft({ start: value.startDate, end: value.endDate });
      setSelecting("start");
      if (value.startDate) {
        const d = parseDate(value.startDate);
        setNavYear(d.getFullYear());
        setNavMonth(d.getMonth());
      }
    }
  }, [open, value.startDate, value.endDate]);

  const goBack = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear((y) => y - 1);
    } else {
      setNavMonth((m) => m - 1);
    }
  };

  const goForward = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear((y) => y + 1);
    } else {
      setNavMonth((m) => m + 1);
    }
  };

  const handleDayClick = (dateStr: string) => {
    if (selecting === "start") {
      setDraft({ start: dateStr, end: undefined });
      setSelecting("end");
    } else {
      const start = draft.start!;
      if (dateStr < start) {
        setDraft({ start: dateStr, end: start });
      } else {
        setDraft({ start, end: dateStr });
      }
      setSelecting("start");
    }
  };

  const handlePresetSelect = (preset: PresetOption) => {
    const range = preset.getRange();
    setDraft(range);
    const d = parseDate(range.start);
    setNavYear(d.getFullYear());
    setNavMonth(d.getMonth());
  };

  const applyCustomRange = () => {
    if (!draft.start || !draft.end) return;
    onChange({
      mode: "custom",
      period: value.period,
      startDate: draft.start,
      endDate: draft.end,
    });
    setOpen(false);
    setIsFocused(false);
  };

  const clearCustomRange = () => {
    onChange({ mode: "period", period: value.period });
    setOpen(false);
    setIsFocused(false);
  };

  const setPeriod = (period: AnalyticsPeriod) => {
    onChange({ mode: "period", period });
    setOpen(false);
    setIsFocused(false);
  };

  const handleClick = () => {
    if (disabled) return;
    setIsFocused((p) => !p);
    setOpen((p) => !p);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setOpen((o) => !o);
      setIsFocused(true);
    }
  };

  const triggerLabel = () => {
    if (value.mode === "custom" && value.startDate && value.endDate) {
      return `${formatDateShort(value.startDate)} – ${formatDateShort(value.endDate)}`;
    }
    const found = PERIOD_OPTIONS.find((o) => o.value === value.period);
    return found ? `${found.label} Period` : "Select Period";
  };

  // Active preset matching
  const activePresetKey = PRESETS.find((p) => {
    if (!draft.start || !draft.end) return false;
    const r = p.getRange();
    return r.start === draft.start && r.end === draft.end;
  })?.key;

  return (
    <div
      className="relative cursor-pointer"
      ref={containerRef}
      onKeyDown={onKeyDown}
    >
      <div
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        className={cn(
          "w-full pl-3 pr-4 py-1.5 border border-gray-300 rounded-lg h-fit",
          "flex items-center justify-between gap-2 relative",
          "transition-all duration-200 focus-within:ring-primary focus-within:ring-2",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <div className="flex items-center gap-2 w-full overflow-hidden">
          <div
            className={cn(
              "w-fit h-fit flex items-center justify-center shrink-0 text-gray-400",
              (open || isFocused) && "text-primary",
            )}
          >
            <CalendarDays size={16} />
          </div>
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            className={cn(
              "w-full resize-y outline-none border-none bg-transparent flex items-center",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <span className="truncate select-none text-sm text-foreground font-medium">
              {triggerLabel()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value.mode === "custom" && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                clearCustomRange();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  clearCustomRange();
                }
              }}
              className="rounded-full p-0.5 hover:bg-accent text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              title="Reset date filter"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <div
            className={cn(
              "transition-transform duration-200 shrink-0",
              open || isFocused ? "rotate-180" : "rotate-0",
            )}
          >
            <ChevronDown size={16} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Popover */}
      {open && !disabled && (
        <Dropdown
          openState={open}
          onClose={() => {
            setOpen(false);
            setIsFocused(false);
          }}
          className={cn(
            direction === "top" ? "bottom-full mb-2" : "mt-2",
            "right-0 w-auto p-0 rounded-2xl overflow-auto select-none",
            "max-w-[95vw] sm:max-w-none",
          )}
          style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
        >
          {/* Header with Period Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-border/60 px-4 py-2.5 bg-muted/20 gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Filter View
            </span>
            <div className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-card p-1 shadow-sm">
              {PERIOD_OPTIONS.map((opt) => {
                const isActive =
                  value.mode === "period" && value.period === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPeriod(opt.value)}
                    className={cn(
                      "rounded-lg px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            {/* Presets Sidebar */}
            <div className="w-full sm:w-44 border-b sm:border-b-0 sm:border-r border-border/60 p-3 bg-muted/20">
              <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                Quick Ranges
              </p>
              <div className="mt-1 flex sm:flex-col gap-1 overflow-x-auto pb-1 sm:pb-0">
                {PRESETS.map((preset) => {
                  const isSelected = activePresetKey === preset.key;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-all shrink-0 whitespace-nowrap cursor-pointer",
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "text-foreground hover:bg-accent/70",
                      )}
                    >
                      <span>{preset.label}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendars Container */}
            <div className="p-4 sm:p-5">
              <div className="flex flex-col md:flex-row gap-6">
                <MiniCalendar
                  year={navYear}
                  month={navMonth}
                  selectedStart={draft.start}
                  selectedEnd={draft.end}
                  hovered={hovered}
                  onDayClick={handleDayClick}
                  onDayHover={setHovered}
                  onPrevMonth={goBack}
                  onNextMonth={undefined}
                />
                <div className="hidden md:block w-px bg-border/60" />
                <div className="hidden md:block">
                  <MiniCalendar
                    year={secondYear}
                    month={secondMonth}
                    selectedStart={draft.start}
                    selectedEnd={draft.end}
                    hovered={hovered}
                    onDayClick={handleDayClick}
                    onDayHover={setHovered}
                    onPrevMonth={undefined}
                    onNextMonth={goForward}
                  />
                </div>
              </div>

              {/* Selection Summary Footer */}
              <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                  {draft.start && draft.end ? (
                    <span>
                      <strong className="text-foreground font-medium">
                        {formatDateShort(draft.start)}
                      </strong>
                      {" → "}
                      <strong className="text-foreground font-medium">
                        {formatDateShort(draft.end)}
                      </strong>{" "}
                      <span className="text-muted-foreground/80 font-normal">
                        ({getDaysDifference(draft.start, draft.end)}{" "}
                        {getDaysDifference(draft.start, draft.end) === 1
                          ? "day"
                          : "days"}
                        )
                      </span>
                    </span>
                  ) : draft.start ? (
                    <span>
                      <strong className="text-foreground font-medium">
                        {formatDateShort(draft.start)}
                      </strong>
                      {" → select end date"}
                    </span>
                  ) : (
                    <span>Select start & end date range</span>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setIsFocused(false);
                    }}
                    className="text-xs h-8 px-3 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!draft.start || !draft.end}
                    onClick={applyCustomRange}
                    className="text-xs h-8 px-3.5 rounded-lg font-medium shadow-sm"
                  >
                    Apply Range
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Dropdown>
      )}
    </div>
  );
};
