"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  findPhoneCountry,
  formatFullPhone,
  parseStoredPhone,
  type PhoneCountry,
} from "../../lib/phone-countries";
import { CountryFlag } from "./country-flag";
import { inputClass } from "./app-shell";

type PhoneInputProps = {
  defaultValue?: string;
  invalid?: boolean;
  name?: string;
  onChange?: (phone: string) => void;
};

function CountryCodePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const country = findPhoneCountry(value);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function choose(next: PhoneCountry) {
    onChange(next.code);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Country code ${country.dialCode}`}
        className={cn(
          inputClass,
          "inline-flex w-[6.75rem] items-center gap-2 px-2.5 text-left",
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <CountryFlag code={country.code} title={country.name} />
        <span className="text-sm font-medium">{country.dialCode}</span>
        <svg
          aria-hidden="true"
          className="ml-auto h-4 w-4 text-[var(--muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </button>

      {open ? (
        <ul
          className="absolute z-20 mt-1 w-52 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--line)] bg-(--panel) py-1 shadow-lg"
          role="listbox"
        >
          {PHONE_COUNTRIES.map((item) => (
            <li key={item.code} role="option" aria-selected={item.code === value}>
              <button
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--panel-soft)]",
                  item.code === value && "bg-[var(--panel-soft)] font-medium",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(item)}
                type="button"
              >
                <CountryFlag code={item.code} title={item.name} />
                <span>{item.name}</span>
                <span className="ml-auto text-[var(--muted)]">{item.dialCode}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function PhoneInput({ defaultValue = "", invalid, name = "phone", onChange }: PhoneInputProps) {
  const parsed = parseStoredPhone(defaultValue);
  const [countryCode, setCountryCode] = useState(
    defaultValue.trim() ? parsed.countryCode : DEFAULT_PHONE_COUNTRY.code,
  );
  const [phoneNumber, setPhoneNumber] = useState(parsed.phoneNumber);

  const country = findPhoneCountry(countryCode);

  useEffect(() => {
    if (defaultValue && !phoneNumber) {
      const p = parseStoredPhone(defaultValue);
      setCountryCode(p.countryCode);
      setPhoneNumber(p.phoneNumber);
    }
  }, [defaultValue, phoneNumber]);

  return (
    <div className="flex gap-2">
      <input name={name} type="hidden" value={formatFullPhone(countryCode, phoneNumber)} />
      <CountryCodePicker
        value={countryCode}
        onChange={(code) => {
          const nextCountry = findPhoneCountry(code);
          setCountryCode(nextCountry.code);
          const nextNum = phoneNumber.slice(0, nextCountry.maxLength);
          setPhoneNumber(nextNum);
          onChange?.(formatFullPhone(nextCountry.code, nextNum));
        }}
      />
      <input
        aria-invalid={invalid}
        aria-label="Phone number"
        className={cn(inputClass, "min-w-0 flex-1")}
        inputMode="numeric"
        maxLength={country.maxLength}
        name={`${name}Number`}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, country.maxLength);
          setPhoneNumber(digits);
          onChange?.(formatFullPhone(countryCode, digits));
        }}
        placeholder={country.placeholder}
        required
        type="tel"
        value={phoneNumber}
      />
      <input name={`${name}Country`} type="hidden" value={countryCode} />
    </div>
  );
}
