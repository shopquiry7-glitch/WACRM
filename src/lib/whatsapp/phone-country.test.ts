import { describe, expect, it } from 'vitest'
import {
  extractDigits,
  formatPhoneDisplay,
  getCountryFromPhone,
} from './phone-country'

describe('phone-country', () => {
  it('extracts digits correctly', () => {
    expect(extractDigits('+92 (316) 055-1876')).toBe('923160551876')
    expect(extractDigits('   ')).toBe('')
    expect(extractDigits(null)).toBe('')
  })

  it('detects country metadata correctly', () => {
    const pk = getCountryFromPhone('+923160551876')
    expect(pk?.iso).toBe('PK')
    expect(pk?.name).toBe('Pakistan')
    expect(pk?.flag).toBe('🇵🇰')

    const uae = getCountryFromPhone('971505053639')
    expect(uae?.iso).toBe('AE')
    expect(uae?.name).toBe('United Arab Emirates')
    expect(uae?.flag).toBe('🇦🇪')

    const us = getCountryFromPhone('+14155552671')
    expect(us?.iso).toBe('US')
    expect(us?.dialCode).toBe('1')

    const gb = getCountryFromPhone('+447911123456')
    expect(gb?.iso).toBe('GB')

    expect(getCountryFromPhone('123')).toBeNull()
    expect(getCountryFromPhone('')).toBeNull()
  })

  it('formats phone numbers with country code and spacing', () => {
    expect(formatPhoneDisplay('+923160551876')).toBe('+92 316 055 1876')
    expect(formatPhoneDisplay('971505053639')).toBe('+971 50 505 3639')
    expect(formatPhoneDisplay('+14155552671')).toBe('+1 415 555 2671')
    expect(formatPhoneDisplay('')).toBe('')
  })
})
