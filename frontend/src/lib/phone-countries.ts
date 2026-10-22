export type PhoneCountry = {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
  pattern: RegExp;
  placeholder: string;
  maxLength: number;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  {
    code: "IN",
    dialCode: "+91",
    flag: "🇮🇳",
    name: "India",
    pattern: /^[6-9]\d{9}$/,
    placeholder: "81234 56789",
    maxLength: 10,
  },
  {
    code: "US",
    dialCode: "+1",
    flag: "🇺🇸",
    name: "United States",
    pattern: /^\d{10}$/,
    placeholder: "555 123 4567",
    maxLength: 10,
  },
  {
    code: "GB",
    dialCode: "+44",
    flag: "🇬🇧",
    name: "United Kingdom",
    pattern: /^\d{10,11}$/,
    placeholder: "7911 123456",
    maxLength: 11,
  },
  {
    code: "AE",
    dialCode: "+971",
    flag: "🇦🇪",
    name: "UAE",
    pattern: /^\d{9}$/,
    placeholder: "50 123 4567",
    maxLength: 9,
  },
  {
    code: "SG",
    dialCode: "+65",
    flag: "🇸🇬",
    name: "Singapore",
    pattern: /^\d{8}$/,
    placeholder: "9123 4567",
    maxLength: 8,
  },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

export function findPhoneCountry(code: string) {
  return PHONE_COUNTRIES.find((country) => country.code === code) ?? DEFAULT_PHONE_COUNTRY;
}

export function parseStoredPhone(value: string) {
  const normalized = value.replace(/\s+/g, "").trim();
  if (!normalized) {
    return { countryCode: DEFAULT_PHONE_COUNTRY.code, phoneNumber: "" };
  }

  for (const country of PHONE_COUNTRIES) {
    const dialDigits = country.dialCode.replace("+", "");
    if (normalized.startsWith(country.dialCode)) {
      return {
        countryCode: country.code,
        phoneNumber: normalized.slice(country.dialCode.length).replace(/\D/g, ""),
      };
    }
    if (normalized.startsWith(dialDigits) && normalized.length > dialDigits.length) {
      const phoneNumber = normalized.slice(dialDigits.length).replace(/\D/g, "");
      if (country.pattern.test(phoneNumber)) {
        return { countryCode: country.code, phoneNumber };
      }
    }
  }

  const digitsOnly = normalized.replace(/\D/g, "");
  if (DEFAULT_PHONE_COUNTRY.pattern.test(digitsOnly)) {
    return { countryCode: DEFAULT_PHONE_COUNTRY.code, phoneNumber: digitsOnly };
  }

  return { countryCode: DEFAULT_PHONE_COUNTRY.code, phoneNumber: digitsOnly };
}

export function formatFullPhone(countryCode: string, phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  if (!digits) return "";
  const country = findPhoneCountry(countryCode);
  return `${country.dialCode}${digits}`;
}

export function validatePhoneFields(formData: FormData, fieldName = "phone") {
  const countryCode =
    typeof formData.get(`${fieldName}Country`) === "string"
      ? String(formData.get(`${fieldName}Country`))
      : DEFAULT_PHONE_COUNTRY.code;
  const phoneNumber = String(formData.get(`${fieldName}Number`) ?? "").replace(/\D/g, "");
  const country = findPhoneCountry(countryCode);

  if (!phoneNumber) {
    return "Mobile phone number is required.";
  }

  if (!country.pattern.test(phoneNumber)) {
    return `Enter a valid ${country.name} mobile number (${country.placeholder}).`;
  }

  return null;
}

