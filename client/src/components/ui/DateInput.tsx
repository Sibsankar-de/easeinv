"use client";

import React, { useEffect, useRef, useState, KeyboardEvent } from "react";
import { cn } from "../utils";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Dropdown } from "./Dropdown";

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

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = parseDate(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export interface DateInputProps {
  value?: string; // YYYY-MM-DD
  onChange?: (value: string) => void;
  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD
  placeholder?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  icon?: React.ReactElement;
  className?: string;
  inputClass?: string;
  id?: string;
  name?: string;
}

export const DateInput = ({
  value = "",
  onChange,
  min,
  max,
  placeholder = "Select date",
  disabled = false,
  isInvalid = false,
  errorMessage,
  icon,
  className,
  inputClass,
  id,
}: DateInputProps) => {
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [direction, setDirection] = useState<"top" | "bottom">("bottom");
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

  const [viewMode, setViewMode] = useState<"day" | "month" | "year">("day");

  const initialDate = value ? parseDate(value) : new Date();
  const [navYear, setNavYear] = useState(initialDate.getFullYear());
  const [navMonth, setNavMonth] = useState(initialDate.getMonth());
  const [yearPage, setYearPage] = useState<number>(initialDate.getFullYear());

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Sync nav month/year when value changes or popover opens
  useEffect(() => {
    if (open) {
      const d = value ? parseDate(value) : new Date();
      setNavYear(d.getFullYear());
      setNavMonth(d.getMonth());
      setYearPage(d.getFullYear());
      setViewMode("day");
    }
  }, [open, value]);

  // Handle position & screen overflow calculation
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

      const configuredMaxHeight = 360;

      const targetDirection =
        spaceBelow < configuredMaxHeight && spaceAbove > spaceBelow
          ? "top"
          : "bottom";

      const availableSpace =
        targetDirection === "top" ? spaceAbove : spaceBelow;

      const effectiveMaxHeight = Math.min(
        configuredMaxHeight,
        Math.max(180, Math.floor(availableSpace)),
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

  const goPrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear((y) => y - 1);
    } else {
      setNavMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear((y) => y + 1);
    } else {
      setNavMonth((m) => m + 1);
    }
  };

  const handleDaySelect = (dateStr: string) => {
    if (disabled) return;
    onChange?.(dateStr);
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

  const hasError = isInvalid || !!errorMessage;

  // Calendar cells calculation
  const totalDays = daysInMonth(navYear, navMonth);
  const startDay = startDayOfMonth(navYear, navMonth);
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const todayStr = toDateStr(new Date());

  return (
    <div
      ref={containerRef}
      className={cn("relative group cursor-pointer w-full", className)}
      onKeyDown={onKeyDown}
    >
      {/* Trigger element matching Input.tsx */}
      <div
        ref={triggerRef}
        id={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onFocus={() => !disabled && setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "w-full pl-3 pr-4 py-1.5 border border-gray-300 rounded-lg bg-card h-fit",
          "flex items-center justify-between gap-2 relative cursor-pointer select-none",
          "focus:outline-none focus-within:outline-none focus-within:ring-2 focus-within:ring-primary",
          "transition-all duration-200",
          hasError &&
            "border-red-300 focus:ring-red-200 focus-within:ring-red-200",
          disabled && "bg-gray-100 cursor-not-allowed opacity-60",
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden w-full">
          <div
            className={cn(
              "w-fit h-fit flex items-center justify-center shrink-0 text-gray-400",
              "group-focus-within:text-primary transition-colors",
            )}
          >
            {icon ?? <CalendarDays size={18} />}
          </div>
          <span
            className={cn(
              "truncate select-none",
              value ? "text-foreground" : "text-muted-foreground",
              inputClass,
            )}
          >
            {value ? formatDateDisplay(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={cn(
              "transition-transform duration-200 shrink-0",
              open ? "rotate-180" : "rotate-0",
            )}
          >
            <ChevronDown size={16} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Popover Dropdown */}
      {!disabled && (
        <Dropdown
          openState={open}
          onClose={() => {
            setOpen(false);
            setIsFocused(false);
          }}
          className={cn(
            direction === "top" ? "bottom-full mb-2" : "mt-2",
            "w-auto p-4 shadow-xl backdrop-blur-md rounded-2xl border border-border/80 overflow-auto select-none",
          )}
          style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
        >
          {/* Custom Calendar Grid / Month Picker / Year Picker */}
          <div
            className="w-[250px] select-none"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {viewMode === "day" && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrevMonth();
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewMode("month");
                      }}
                      className="text-sm font-semibold text-foreground hover:bg-accent hover:text-primary rounded px-1.5 py-0.5 transition-colors cursor-pointer tracking-tight"
                    >
                      {MONTHS[navMonth]}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setYearPage(navYear);
                        setViewMode("year");
                      }}
                      className="text-sm font-semibold text-foreground hover:bg-accent hover:text-primary rounded px-1.5 py-0.5 transition-colors cursor-pointer tracking-tight"
                    >
                      {navYear}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goNextMonth();
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Weekdays */}
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

                {/* Days */}
                <div className="grid grid-cols-7 gap-y-1 text-center">
                  {cells.map((day, idx) => {
                    if (day === null)
                      return <div key={`blank-${idx}`} className="h-8" />;
                    const dateStr = `${navYear}-${String(navMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                    const isSelected = dateStr === value;
                    const isToday = dateStr === todayStr;

                    const isDisabled =
                      (min ? dateStr < min : false) ||
                      (max ? dateStr > max : false);

                    return (
                      <div
                        key={dateStr}
                        className="h-8 flex items-center justify-center"
                      >
                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDaySelect(dateStr);
                          }}
                          className={cn(
                            "h-8 w-8 rounded-full text-xs font-medium transition-all flex items-center justify-center cursor-pointer",
                            isDisabled &&
                              "cursor-not-allowed opacity-30 text-muted-foreground",
                            !isDisabled &&
                              !isSelected &&
                              "hover:bg-accent hover:text-foreground text-foreground",
                            isToday &&
                              !isSelected &&
                              "font-bold text-primary ring-1 ring-primary/40",
                            isSelected &&
                              "bg-primary text-primary-foreground font-semibold shadow-sm hover:brightness-110 scale-105",
                          )}
                        >
                          {day}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {viewMode === "month" && (
              <>
                {/* Header for Month Mode */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNavYear((y) => y - 1);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setYearPage(navYear);
                      setViewMode("year");
                    }}
                    className="text-sm font-semibold text-foreground hover:bg-accent hover:text-primary rounded px-2 py-0.5 transition-colors cursor-pointer tracking-tight"
                  >
                    {navYear}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNavYear((y) => y + 1);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* 3x4 Months Grid */}
                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  {MONTHS.map((mName, mIdx) => {
                    const isSelectedMonth =
                      mIdx === navMonth &&
                      (value
                        ? parseDate(value).getFullYear() === navYear
                        : false);
                    const isCurrentNavMonth = mIdx === navMonth;
                    const isMonthDisabled =
                      (min
                        ? `${navYear}-${String(mIdx + 1).padStart(2, "0")}-${String(daysInMonth(navYear, mIdx)).padStart(2, "0")}` <
                          min
                        : false) ||
                      (max
                        ? `${navYear}-${String(mIdx + 1).padStart(2, "0")}-01` >
                          max
                        : false);

                    return (
                      <button
                        key={mName}
                        type="button"
                        disabled={isMonthDisabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNavMonth(mIdx);
                          setViewMode("day");
                        }}
                        className={cn(
                          "py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                          isMonthDisabled &&
                            "cursor-not-allowed opacity-30 text-muted-foreground",
                          !isMonthDisabled &&
                            !isSelectedMonth &&
                            "hover:bg-accent hover:text-foreground text-foreground",
                          isCurrentNavMonth &&
                            !isSelectedMonth &&
                            "ring-1 ring-primary/40 text-primary font-bold",
                          isSelectedMonth &&
                            "bg-primary text-primary-foreground font-semibold shadow-sm",
                        )}
                      >
                        {mName.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {viewMode === "year" && (
              <>
                {/* Header for Year Mode */}
                {(() => {
                  const startYear = Math.floor(yearPage / 12) * 12;
                  const endYear = startYear + 11;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setYearPage((y) => y - 12);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-semibold text-foreground tracking-tight">
                          {startYear} – {endYear}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setYearPage((y) => y + 12);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      {/* 3x4 Years Grid */}
                      <div className="grid grid-cols-3 gap-2 text-center py-1">
                        {Array.from(
                          { length: 12 },
                          (_, i) => startYear + i,
                        ).map((yr) => {
                          const isSelectedYear = value
                            ? parseDate(value).getFullYear() === yr
                            : false;
                          const isCurrentNavYear = yr === navYear;
                          const isYrDisabled =
                            (min ? `${yr}-12-31` < min : false) ||
                            (max ? `${yr}-01-01` > max : false);

                          return (
                            <button
                              key={yr}
                              type="button"
                              disabled={isYrDisabled}
                              onClick={(e) => {
                                e.stopPropagation();
                                setNavYear(yr);
                                setViewMode("month");
                              }}
                              className={cn(
                                "py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                isYrDisabled &&
                                  "cursor-not-allowed opacity-30 text-muted-foreground",
                                !isYrDisabled &&
                                  !isSelectedYear &&
                                  "hover:bg-accent hover:text-foreground text-foreground",
                                isCurrentNavYear &&
                                  !isSelectedYear &&
                                  "ring-1 ring-primary/40 text-primary font-bold",
                                isSelectedYear &&
                                  "bg-primary text-primary-foreground font-semibold shadow-sm",
                              )}
                            >
                              {yr}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </Dropdown>
      )}

      {errorMessage && (
        <p className="text-red-400 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
};
