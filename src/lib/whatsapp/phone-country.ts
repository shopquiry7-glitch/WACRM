/**
 * Phone number country detection, formatting, and flag utilities.
 */

export interface CountryMeta {
  iso: string
  name: string
  dialCode: string
  flag: string
}

// Ordered list of countries with dial codes.
// Note: When matching, longer dial codes will be checked first
// so e.g. +971 (UAE) matches before +97, +1 (US/CA) matches +1, etc.
export const COUNTRIES: CountryMeta[] = [
  // North America
  { iso: 'US', name: 'United States', dialCode: '1', flag: '🇺🇸' },
  { iso: 'CA', name: 'Canada', dialCode: '1', flag: '🇨🇦' },

  // Middle East & South Asia
  { iso: 'PK', name: 'Pakistan', dialCode: '92', flag: '🇵🇰' },
  { iso: 'AE', name: 'United Arab Emirates', dialCode: '971', flag: '🇦🇪' },
  { iso: 'SA', name: 'Saudi Arabia', dialCode: '966', flag: '🇸🇦' },
  { iso: 'IN', name: 'India', dialCode: '91', flag: '🇮🇳' },
  { iso: 'BD', name: 'Bangladesh', dialCode: '880', flag: '🇧🇩' },
  { iso: 'QA', name: 'Qatar', dialCode: '974', flag: '🇶🇦' },
  { iso: 'OM', name: 'Oman', dialCode: '968', flag: '🇴🇲' },
  { iso: 'KW', name: 'Kuwait', dialCode: '965', flag: '🇰🇼' },
  { iso: 'BH', name: 'Bahrain', dialCode: '973', flag: '🇧🇭' },
  { iso: 'LK', name: 'Sri Lanka', dialCode: '94', flag: '🇱🇰' },
  { iso: 'NP', name: 'Nepal', dialCode: '977', flag: '🇳🇵' },
  { iso: 'TR', name: 'Turkey', dialCode: '90', flag: '🇹🇷' },
  { iso: 'EG', name: 'Egypt', dialCode: '20', flag: '🇪🇬' },
  { iso: 'JO', name: 'Jordan', dialCode: '962', flag: '🇯🇴' },
  { iso: 'LB', name: 'Lebanon', dialCode: '961', flag: '🇱🇧' },
  { iso: 'IQ', name: 'Iraq', dialCode: '964', flag: '🇮🇶' },

  // Europe
  { iso: 'GB', name: 'United Kingdom', dialCode: '44', flag: '🇬🇧' },
  { iso: 'DE', name: 'Germany', dialCode: '49', flag: '🇩🇪' },
  { iso: 'FR', name: 'France', dialCode: '33', flag: '🇫🇷' },
  { iso: 'IT', name: 'Italy', dialCode: '39', flag: '🇮🇹' },
  { iso: 'ES', name: 'Spain', dialCode: '34', flag: '🇪🇸' },
  { iso: 'NL', name: 'Netherlands', dialCode: '31', flag: '🇳🇱' },
  { iso: 'BE', name: 'Belgium', dialCode: '32', flag: '🇧🇪' },
  { iso: 'CH', name: 'Switzerland', dialCode: '41', flag: '🇨🇭' },
  { iso: 'SE', name: 'Sweden', dialCode: '46', flag: '🇸🇪' },
  { iso: 'NO', name: 'Norway', dialCode: '47', flag: '🇳🇴' },
  { iso: 'DK', name: 'Denmark', dialCode: '45', flag: '🇩🇰' },
  { iso: 'FI', name: 'Finland', dialCode: '358', flag: '🇫🇮' },
  { iso: 'IE', name: 'Ireland', dialCode: '353', flag: '🇮🇪' },
  { iso: 'PT', name: 'Portugal', dialCode: '351', flag: '🇵🇹' },
  { iso: 'AT', name: 'Austria', dialCode: '43', flag: '🇦🇹' },
  { iso: 'PL', name: 'Poland', dialCode: '48', flag: '🇵🇱' },
  { iso: 'GR', name: 'Greece', dialCode: '30', flag: '🇬🇷' },
  { iso: 'RO', name: 'Romania', dialCode: '40', flag: '🇷🇴' },
  { iso: 'UA', name: 'Ukraine', dialCode: '380', flag: '🇺🇦' },
  { iso: 'RU', name: 'Russia', dialCode: '7', flag: '🇷🇺' },

  // Asia-Pacific
  { iso: 'AU', name: 'Australia', dialCode: '61', flag: '🇦🇺' },
  { iso: 'NZ', name: 'New Zealand', dialCode: '64', flag: '🇳🇿' },
  { iso: 'SG', name: 'Singapore', dialCode: '65', flag: '🇸🇬' },
  { iso: 'MY', name: 'Malaysia', dialCode: '60', flag: '🇲🇾' },
  { iso: 'ID', name: 'Indonesia', dialCode: '62', flag: '🇮🇩' },
  { iso: 'PH', name: 'Philippines', dialCode: '63', flag: '🇵🇭' },
  { iso: 'TH', name: 'Thailand', dialCode: '66', flag: '🇹🇭' },
  { iso: 'VN', name: 'Vietnam', dialCode: '84', flag: '🇻🇳' },
  { iso: 'CN', name: 'China', dialCode: '86', flag: '🇨🇳' },
  { iso: 'JP', name: 'Japan', dialCode: '81', flag: '🇯🇵' },
  { iso: 'KR', name: 'South Korea', dialCode: '82', flag: '🇰🇷' },
  { iso: 'HK', name: 'Hong Kong', dialCode: '852', flag: '🇭🇰' },

  // Latin America
  { iso: 'BR', name: 'Brazil', dialCode: '55', flag: '🇧🇷' },
  { iso: 'MX', name: 'Mexico', dialCode: '52', flag: '🇲🇽' },
  { iso: 'AR', name: 'Argentina', dialCode: '54', flag: '🇦🇷' },
  { iso: 'CO', name: 'Colombia', dialCode: '57', flag: '🇨🇴' },
  { iso: 'CL', name: 'Chile', dialCode: '56', flag: '🇨🇱' },
  { iso: 'PE', name: 'Peru', dialCode: '51', flag: '🇵🇪' },

  // Africa
  { iso: 'ZA', name: 'South Africa', dialCode: '27', flag: '🇿🇦' },
  { iso: 'NG', name: 'Nigeria', dialCode: '234', flag: '🇳🇬' },
  { iso: 'KE', name: 'Kenya', dialCode: '254', flag: '🇰🇪' },
  { iso: 'GH', name: 'Ghana', dialCode: '233', flag: '🇬🇭' },
  { iso: 'MA', name: 'Morocco', dialCode: '212', flag: '🇲🇦' },
]

// Sorted by dialCode length descending for prefix matching
const SORTED_COUNTRIES = [...COUNTRIES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
)

/**
 * Clean phone number to digits only.
 */
export function extractDigits(phone: string | null | undefined): string {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

/**
 * Detect country metadata from a phone number (E.164 with or without '+').
 */
export function getCountryFromPhone(
  phone: string | null | undefined
): CountryMeta | null {
  const digits = extractDigits(phone)
  if (!digits || digits.length < 5) return null

  for (const country of SORTED_COUNTRIES) {
    if (digits.startsWith(country.dialCode)) {
      return country
    }
  }

  return null
}

/**
 * Format a phone number cleanly with country code and spaced groups.
 * e.g. "923160551876" -> "+92 316 0551876"
 *      "971505053639" -> "+971 50 5053639"
 *      "14155552671"  -> "+1 415 555 2671"
 */
export function formatPhoneDisplay(
  phone: string | null | undefined
): string {
  if (!phone) return ''
  const trimmed = phone.trim()
  const digits = extractDigits(trimmed)
  if (!digits) return trimmed

  const country = getCountryFromPhone(digits)
  if (!country) {
    // If not matching our dictionary, prefix with + if not already
    return trimmed.startsWith('+') ? trimmed : `+${digits}`
  }

  const national = digits.slice(country.dialCode.length)
  if (!national) return `+${country.dialCode}`

  // Format national number nicely
  let formattedNational = national
  if (national.length === 10) {
    // e.g. 316 055 1876 or 415 555 2671
    formattedNational = `${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`
  } else if (national.length === 9) {
    // e.g. 50 505 3639 (UAE)
    formattedNational = `${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`
  } else if (national.length > 6) {
    formattedNational = `${national.slice(0, 3)} ${national.slice(3)}`
  }

  return `+${country.dialCode} ${formattedNational}`
}
