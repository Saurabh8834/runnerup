"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { inputClass } from "./app-shell";

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
    return options.filter((option) => option.toLowerCase().includes(needle));
  }, [options, query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(selected);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [selected]);

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
