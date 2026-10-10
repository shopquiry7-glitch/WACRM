// E.164 International Phone Number Normalizer & Country Formatter
// Special support for UAE (+971) & KSA (+966) mobile & landline prefixes

export interface CountryPreset {
  name: string;
  code: string; // e.g. '+971'
  flag: string;
  iso: string;
  placeholder: string;
  sampleNumber: string;
  description: string;
  length: number; // typical national length
}

export const SUPPORTED_COUNTRIES: CountryPreset[] = [
  {
    name: 'United Arab Emirates (UAE)',
    code: '+971',
    flag: '🇦🇪',
    iso: 'AE',
    placeholder: '50 123 4567',
    sampleNumber: '+971 50 505 3639',
    description: 'Dubai, Abu Dhabi, Sharjah & Emirates (050, 052, 054, 055, 056, 058)',
    length: 9,
  },
  {
    name: 'Saudi Arabia (KSA)',
    code: '+966',
    flag: '🇸🇦',
    iso: 'SA',
    placeholder: '50 123 4567',
    sampleNumber: '+966 50 123 4567',
    description: 'Riyadh, Jeddah, Mecca, Medina, Dammam (050, 053, 054, 055, 056, 058, 059)',
    length: 9,
  },
  {
    name: 'Pakistan',
    code: '+92',
    flag: '🇵🇰',
    iso: 'PK',
    placeholder: '300 1234567',
    sampleNumber: '+92 300 1234567',
    description: 'Karachi, Lahore, Islamabad (0300, 0321, 0333, 0345)',
    length: 10,
  },
  {
    name: 'United States / Canada',
    code: '+1',
    flag: '🇺🇸',
    iso: 'US',
    placeholder: '(555) 019-2831',
    sampleNumber: '+1 (555) 019-2831',
    description: 'North American Numbering Plan',
    length: 10,
  },
  {
    name: 'United Kingdom',
    code: '+44',
    flag: '🇬🇧',
    iso: 'GB',
    placeholder: '7911 123456',
    sampleNumber: '+44 7911 123456',
    description: 'London, Manchester & UK Mobiles (07...)',
    length: 10,
  },
  {
    name: 'Qatar',
    code: '+974',
    flag: '🇶🇦',
    iso: 'QA',
    placeholder: '3312 3456',
    sampleNumber: '+974 3312 3456',
    description: 'Doha & Qatar Mobiles (33..., 55..., 66...)',
    length: 8,
  },
  {
    name: 'Kuwait',
    code: '+965',
    flag: '🇰🇼',
    iso: 'KW',
    placeholder: '9123 4567',
    sampleNumber: '+965 9123 4567',
    description: 'Kuwait City & Mobiles (5..., 6..., 9...)',
    length: 8,
  },
];

/**
 * Normalizes any phone number into strict E.164 format (+XXXXXXXXXXX)
 */
export function formatE164(raw: string, defaultCountryCode = '+971'): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  // If already starts with '+', strip non-digits except leading '+'
  if (trimmed.startsWith('+')) {
    return '+' + trimmed.slice(1).replace(/\D/g, '');
  }

  const digits = trimmed.replace(/\D/g, '');

  // If starts with '00', replace with '+'
  if (trimmed.startsWith('00')) {
    return '+' + digits.slice(2);
  }

  // If starts with country code digits (e.g. 971 or 966)
  if (digits.startsWith('971') && digits.length >= 11) {
    return '+' + digits;
  }
  if (digits.startsWith('966') && digits.length >= 11) {
    return '+' + digits;
  }
  if (digits.startsWith('92') && digits.length >= 11) {
    return '+' + digits;
  }
  if (digits.startsWith('1') && digits.length === 11) {
    return '+' + digits;
  }

  // Local leading zero (e.g. 050 123 4567 -> 50 123 4567)
  const nationalDigits = digits.startsWith('0') ? digits.slice(1) : digits;

  const prefix = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
  return `${prefix}${nationalDigits}`;
}

/**
 * Detects country preset from phone string
 */
export function detectCountry(phone: string): CountryPreset {
  const clean = phone.trim();
  for (const c of SUPPORTED_COUNTRIES) {
    if (clean.startsWith(c.code)) {
      return c;
    }
  }
  // Default to UAE for Gulf region
  return SUPPORTED_COUNTRIES[0];
}

/**
 * Formats a phone number for display with country flag and spacing
 */
export function formatDisplayPhone(phone: string): string {
  const clean = phone.trim();
  if (clean.startsWith('+971')) {
    const rest = clean.slice(4).replace(/\D/g, '');
    if (rest.length <= 2) return `+971 ${rest}`;
    if (rest.length <= 5) return `+971 ${rest.slice(0, 2)} ${rest.slice(2)}`;
    return `+971 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`;
  }
  if (clean.startsWith('+966')) {
    const rest = clean.slice(4).replace(/\D/g, '');
    if (rest.length <= 2) return `+966 ${rest}`;
    if (rest.length <= 5) return `+966 ${rest.slice(0, 2)} ${rest.slice(2)}`;
    return `+966 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`;
  }
  if (clean.startsWith('+92')) {
    const rest = clean.slice(3).replace(/\D/g, '');
    if (rest.length <= 3) return `+92 ${rest}`;
    return `+92 ${rest.slice(0, 3)} ${rest.slice(3, 10)}`;
  }
  return clean;
}
