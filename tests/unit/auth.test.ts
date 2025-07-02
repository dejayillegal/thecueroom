import { describe, it, expect } from 'vitest';
import { generateTemporaryPassword } from '../../server/auth';

function hasUpper(str: string) {
  return /[A-Z]/.test(str);
}

function hasLower(str: string) {
  return /[a-z]/.test(str);
}

function hasDigit(str: string) {
  return /[0-9]/.test(str);
}

function hasSpecial(str: string) {
  return /[!@#$%]/.test(str);
}

describe('generateTemporaryPassword', () => {
  it('returns an 8 character string with required character classes', () => {
    const pwd = generateTemporaryPassword();
    expect(typeof pwd).toBe('string');
    expect(pwd).toHaveLength(8);
    expect(hasUpper(pwd)).toBe(true);
    expect(hasLower(pwd)).toBe(true);
    expect(hasDigit(pwd)).toBe(true);
    expect(hasSpecial(pwd)).toBe(true);
  });
});
