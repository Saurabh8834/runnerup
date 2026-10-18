"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { inputClass } from "./app-shell";
import { normalizeIndianState } from "../../lib/indian-states";

type SearchableSelectProps = {
  name: string;
  options: readonly string[];
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  required?: boolean;
  invalid?: boolean;
  emptyMessage?: string;
};

export function SearchableSelect({
  name,
  options,
  placeholder = "Search and select…",
  defaultValue = "",
  value,
  onChange,
  required,
  invalid,
  emptyMessage = "No matches found.",
}: SearchableSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(defaultValue);
  const selected = value !== undefined ? value : internalSelected;
  const [query, setQuery] = useState(selected);

  // Sync query with external value changes
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return [...options];
    }
    const cleanNeedle = needle
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return options.filter((option) => {
      const lower = option.toLowerCase();
      if (lower.includes(needle)) return true;
      const cleanOption = lower
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (cleanNeedle && cleanOption.includes(cleanNeedle)) return true;

      const norm = normalizeIndianState(needle);
      if (norm && norm.toLowerCase() === lower) return true;

      return false;
    });
  }, [options, query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        const resolved =
          options.find((o) => o.toLowerCase() === query.trim().toLowerCase()) ||
          normalizeIndianState(query);
        if (resolved && (options as readonly string[]).includes(resolved)) {
          chooseOption(resolved);
        } else {
          setQuery(selected);
        }
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [selected, query, options]);

  function chooseOption(option: string) {
    if (value === undefined) {
      setInternalSelected(option);
    }
    setQuery(option);
    setOpen(false);
    onChange?.(option);
  }

  return (
    <div ref={containerRef} className="relative">
      <input name={name} type="hidden" value={selected} required={required} />
      <input
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-invalid={invalid}
        autoComplete="off"
        className={cn(inputClass, "pr-10")}
        onChange={(event) => {
          setQuery(event.target.value);
          if (value === undefined) {
            setInternalSelected("");
          }
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const resolved =
              options.find((o) => o.toLowerCase() === query.trim().toLowerCase()) ||
              normalizeIndianState(query);
            if (resolved && (options as readonly string[]).includes(resolved)) {
              chooseOption(resolved);
            } else if (filtered.length > 0) {
              chooseOption(filtered[0]);
            }
          }
        }}
        placeholder={placeholder}
        role="combobox"
        type="text"
        value={query}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-(--muted)">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </span>

      {open ? (
        <ul
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-(--line) bg-(--panel) py-1 shadow-lg"
          id={listboxId}
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-(--muted)">{emptyMessage}</li>
          ) : (
            filtered.map((option) => (
              <li key={option} role="option" aria-selected={option === selected}>
                <button
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-(--panel-soft)",
                    option === selected && "bg-(--panel-soft) font-medium text-(--sage)",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseOption(option)}
                  type="button"
                >
                  {option}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
