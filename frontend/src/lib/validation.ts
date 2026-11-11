import { validatePhoneFields } from "./phone-countries";
import { isIndianState } from "./indian-states";

export type FieldErrors = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pincodePattern = /^[1-9][0-9]{5}$/;

export function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateEmail(email: string): string | null {
  if (!email) return "Email is required.";
  if (!emailPattern.test(email)) return "Enter a valid email address.";
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value) return `${label} is required.`;
  return null;
}

export function validateMinLength(value: string, min: number, label: string): string | null {
  if (value.length < min) return `${label} must be at least ${min} characters.`;
  return null;
}

export function validateMaxLength(value: string, max: number, label: string): string | null {
  if (value.length > max) return `${label} must be ${max} characters or fewer.`;
  return null;
}

export function validateNumber(value: string, label: string): string | null {
  const n = Number(value);
  if (!value || Number.isNaN(n)) return `Enter a valid number for ${label}.`;
  return null;
}

export function validatePositiveInt(value: string, label: string): string | null {
  const n = Number(value);
  if (!value || Number.isNaN(n) || n < 1 || !Number.isInteger(n)) return `${label} must be a positive whole number.`;
  return null;
}

export function validateUrl(value: string): string | null {
  if (!value) return null;
  if (!/^https?:\/\/.+/.test(value)) return "Enter a valid URL starting with http:// or https://.";
  return null;
}

export function validateRegistrationForm(formData: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = asString(formData.get("name"));
  const username = asString(formData.get("username"));
  const email = asString(formData.get("email"));
  const distance = asString(formData.get("distance"));
  const eventSlug = asString(formData.get("eventSlug"));
  const city = asString(formData.get("city"));
  const state = asString(formData.get("state"));
  const pincode = asString(formData.get("pincode"));
  const address = asString(formData.get("address"));
  const landmark = asString(formData.get("landmark"));

  const nameErr = validateMinLength(name, 2, "Full name");
  if (nameErr) errors.name = nameErr;

  if (username && username.length > 0) {
    if (username.length < 3) {
      errors.username = "Username must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = "Username can only contain alphanumeric characters and underscores.";
    }
  }

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const phoneError = validatePhoneFields(formData);
  if (phoneError) errors.phone = phoneError;

  if (!distance) errors.distance = "Select a distance.";
  if (!eventSlug) errors.eventSlug = "Select an event.";

  const cityErr = validateMinLength(city, 2, "City");
  if (cityErr) errors.city = cityErr;

  if (!state) errors.state = "Select a state.";
  else if (!isIndianState(state)) errors.state = "Choose a valid Indian state from the list.";

  if (!pincodePattern.test(pincode)) errors.pincode = "Enter a valid 6-digit pincode.";

  const addrErr = validateMinLength(address, 5, "Shipping address");
  if (addrErr) errors.address = addrErr;

  const landmarkErr = validateMaxLength(landmark, 120, "Landmark");
  if (landmarkErr) errors.landmark = landmarkErr;

  return errors;
}

export function getValidationSummaryMessage(errors: FieldErrors) {
  const messages = Object.values(errors).filter(Boolean);

  if (messages.length === 0) return "";
  if (messages.length === 1) return messages[0];

  return `Please review the ${messages.length} highlighted fields below before continuing to payment.`;
}

export function validateAdminEventForm(formData: FormData, isUpdate = false): FieldErrors {
  const errors: FieldErrors = {};
  const title = asString(formData.get("title"));
  const distances = asString(formData.get("distances"));
  const price = asString(formData.get("price"));

  if (title.length < 3) errors.title = "Event title must be at least 3 characters.";

  if (!distances || !distances.split(",").some((part) => part.trim().length > 0)) {
    errors.distances = "Add at least one distance (e.g. 5 km, 10 km).";
  }

  const priceNumber = Number(price);
  if (!isUpdate) {
    if (!price || Number.isNaN(priceNumber) || priceNumber < 1) {
      errors.price = "Enter a valid price in rupees (minimum 1).";
    }
  } else if (price) {
    if (Number.isNaN(priceNumber) || priceNumber < 1) {
      errors.price = "Enter a valid price in rupees (minimum 1).";
    }
  }

  return errors;
}

export function validateAdminCouponForm(code: string, discountInr: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!code || code.trim().length < 3) errors.code = "Coupon code must be at least 3 characters.";
  if (code.length > 40) errors.code = "Coupon code must be 40 characters or fewer.";
  const discount = Number(discountInr);
  if (!discountInr || Number.isNaN(discount) || discount < 1 || !Number.isInteger(discount)) {
    errors.discountInr = "Enter a valid discount amount in whole rupees.";
  }
  return errors;
}

export function validateNewsletterForm(subject: string, body: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!subject.trim()) errors.subject = "Subject is required.";
  else if (subject.length > 200) errors.subject = "Subject must be 200 characters or fewer.";
  if (!body.trim()) errors.body = "Body is required.";
  else if (body.length > 10000) errors.body = "Body must be 10000 characters or fewer.";
  return errors;
}

export function validateMediaForm(data: { title: string; imageUrl: string; category?: string; location?: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.title || data.title.length < 2) errors.title = "Title must be at least 2 characters.";
  if (data.title && data.title.length > 120) errors.title = "Title must be 120 characters or fewer.";
  if (!data.imageUrl) errors.imageUrl = "Image URL or file upload is required.";
  if (data.category && (data.category.length < 2 || data.category.length > 40)) errors.category = "Category must be 2-40 characters.";
  if (data.location && data.location.length > 80) errors.location = "Location must be 80 characters or fewer.";
  return errors;
}

export function validateReviewForm(data: { name: string; role: string; quote: string; rating: number }): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.name || data.name.length < 2) errors.name = "Name must be at least 2 characters.";
  if (data.name && data.name.length > 80) errors.name = "Name must be 80 characters or fewer.";
  if (!data.role || data.role.length < 2) errors.role = "Role must be at least 2 characters.";
  if (data.role && data.role.length > 80) errors.role = "Role must be 80 characters or fewer.";
  if (!data.quote || data.quote.length < 8) errors.quote = "Quote must be at least 8 characters.";
  if (data.quote && data.quote.length > 600) errors.quote = "Quote must be 600 characters or fewer.";
  if (!data.rating || data.rating < 1 || data.rating > 5) errors.rating = "Rating must be between 1 and 5.";
  return errors;
}

export function parseTimeToSeconds(input: string | number | null | undefined): number | null {
  if (input == null) return null;
  if (typeof input === "number") return input > 0 ? input : null;
  const str = String(input).trim();
  if (!str) return null;

  // Format: HH:MM:SS or MM:SS (e.g. "33:06", "01:25:30")
  if (str.includes(":")) {
    const parts = str.split(":").map((p) => parseFloat(p.trim()));
    if (parts.some((p) => Number.isNaN(p) || p < 0)) return null;
    if (parts.length === 3) {
      return Math.round((parts[0] * 3600) + (parts[1] * 60) + parts[2]);
    }
    if (parts.length === 2) {
      return Math.round((parts[0] * 60) + parts[1]);
    }
  }

  // Format: e.g. "33m 6s" or "1h 20m 10s"
  const hMatch = str.match(/(\d+)\s*h/i);
  const mMatch = str.match(/(\d+)\s*m/i);
  const sMatch = str.match(/(\d+)\s*s/i);
  if (hMatch || mMatch || sMatch) {
    const h = hMatch ? parseInt(hMatch[1], 10) : 0;
    const m = mMatch ? parseInt(mMatch[1], 10) : 0;
    const s = sMatch ? parseInt(sMatch[1], 10) : 0;
    const total = (h * 3600) + (m * 60) + s;
    return total > 0 ? total : null;
  }

  // Fallback: simple numeric minutes
  const num = parseFloat(str);
  if (!Number.isNaN(num) && num > 0) {
    return Math.round(num * 60);
  }

  return null;
}

export function validateProofForm(data: {
  proofUrl: string;
  sourceApp?: string;
  finishMinutes?: string;
  finishHours?: string;
  finishSeconds?: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.proofUrl || !data.proofUrl.trim()) {
    errors.proofUrl = "Upload a screenshot or paste an image URL.";
  }
  if (!data.sourceApp || !data.sourceApp.trim()) {
    errors.sourceApp = "Select a source app.";
  }

  const hStr = (data.finishHours ?? "").trim();
  const mStr = (data.finishMinutes ?? "").trim();
  const sStr = (data.finishSeconds ?? "").trim();

  if (!hStr && !mStr && !sStr) {
    errors.finishTime = "Please enter the exact finish time from your screenshot.";
  } else {
    const h = hStr ? Number(hStr) : 0;
    const m = mStr ? Number(mStr) : 0;
    const s = sStr ? Number(sStr) : 0;

    if (Number.isNaN(h) || !Number.isInteger(h) || h < 0 || h > 23) {
      errors.finishHours = "Hours must be between 0 and 23.";
    }
    if (Number.isNaN(m) || !Number.isInteger(m) || m < 0 || m > 59) {
      errors.finishMinutes = "Minutes must be between 0 and 59.";
    }
    if (Number.isNaN(s) || !Number.isInteger(s) || s < 0 || s > 59) {
      errors.finishSeconds = "Seconds must be between 0 and 59.";
    }

    const totalSecs = h * 3600 + m * 60 + s;
    if (totalSecs <= 0) {
      errors.finishTime = "Finish time must be greater than 00:00:00.";
    } else if (totalSecs < 60) {
      errors.finishTime = "Finish time must be at least 1 minute.";
    }
  }

  return errors;
}

export function validateDemoProofForm(formData: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = asString(formData.get("name"));
  const distance = asString(formData.get("distance"));
  const address = asString(formData.get("address"));
  const proof = formData.get("proof") as File | null;

  const nameErr = validateMinLength(name, 2, "Full name");
  if (nameErr) errors.name = nameErr;

  if (!distance) errors.distance = "Select a distance.";

  const addrErr = validateMinLength(address, 5, "Shipping address");
  if (addrErr) errors.address = addrErr;

  if (!proof || proof.size === 0) errors.proof = "Please upload a GPS activity proof file.";

  return errors;
}
