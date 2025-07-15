import 'module-alias/register';
import { describe, it, expect } from 'vitest';
// Use built server module for stable imports during tests
import { generateTemporaryPassword, hashPassword, comparePasswords } from '../../dist/server/auth.js';

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

describe('password hashing and comparison', () => {
  it('hashes and compares passwords correctly', async () => {
    const hashed = await hashPassword('secret');
    const result = await comparePasswords('secret', hashed);
    expect(result).toBe(true);
  });

  it('returns false for invalid stored format', async () => {
    const result = await comparePasswords('secret', 'invalid');
    expect(result).toBe(false);
  });
});
