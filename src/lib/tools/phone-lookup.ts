/**
 * Phone lookup tool — basic carrier and country detection by number pattern.
 */

export function phoneLookup(phone: string) {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  const hasCountryCode = cleaned.startsWith("+");
  const digits = cleaned.replace("+", "");

  // Basic carrier detection by number pattern
  let country = "Unknown";
  if (digits.startsWith("1")) country = "United States/Canada";
  else if (digits.startsWith("44")) country = "United Kingdom";
  else if (digits.startsWith("61")) country = "Australia";
  else if (digits.startsWith("33")) country = "France";
  else if (digits.startsWith("49")) country = "Germany";
  else if (digits.startsWith("81")) country = "Japan";
  else if (digits.startsWith("86")) country = "China";
  else if (digits.startsWith("91")) country = "India";
  else if (digits.startsWith("7")) country = "Russia/Kazakhstan";

  return {
    phone: cleaned,
    raw: phone,
    country,
    hasCountryCode,
    digitCount: digits.length,
    valid: digits.length >= 7 && digits.length <= 15,
    format: hasCountryCode ? `+${digits}` : digits,
  };
}
