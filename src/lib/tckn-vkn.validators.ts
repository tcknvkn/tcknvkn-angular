/**
 * @file tckn-vkn.validators.ts
 * @description Angular Reactive Forms için TCKN/VKN doğrulama fonksiyonları ve validator üreticileri.
 * @created 2026-04-24
 * @license MIT
 * @see https://www.tcknvkn.com
 * @see https://www.tcknvkn.com/kutuphaneler/angular
 */
import type { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

const TCKN_LENGTH = 11;
const VKN_LENGTH = 10;

type ValidationKey = "tckn" | "vkn";

/**
 * Validator davranışını özelleştiren seçenekler.
 */
export interface ValidatorOptions {
  /**
   * `true` ise boş değerler geçerli kabul edilir.
   * Zorunlu alanlar için Angular `Validators.required` ile birlikte kullanın.
   */
  allowEmpty?: boolean;
}

/**
 * Angular form hata detaylarını taşıyan model.
 */
export interface ValidatorErrorDetail {
  /** Doğrulama sırasında üretilen hata mesajları. */
  errors: string[];

  /** Girişin yalnızca rakamlardan oluşan normalize edilmiş hali. */
  value: string;
}

/**
 * Core doğrulama sonucunu taşıyan model.
 */
export interface ValidationResult {
  /** Tüm kurallar geçtiyse `true`, aksi halde `false`. */
  valid: boolean;

  /** Girişin yalnızca rakamlardan oluşan normalize edilmiş hali. */
  value: string;

  /** Doğrulama adımlarında oluşan hata mesajları. */
  errors: string[];
}

/**
 * Kontrol değerini güvenli biçimde string'e dönüştürür.
 *
 * @param value - Angular kontrolünden gelen ham değer.
 * @returns String'e dönüştürülmüş değer.
 */
function normalizeControlValue(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

/**
 * Değerin boş kabul edilip edilmeyeceğini kontrol eder.
 *
 * @param value - Ham metin.
 * @returns Yalnızca boşluklardan oluşan değerlerde `true` döner.
 */
function isEmptyValue(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Girdi içindeki rakam dışı karakterleri temizler.
 *
 * `tc üret`, `tc uret`, `tc no uret` ve `vergi no üret` gibi akışlarda
 * kullanıcı girişini normalize etmek için kullanılır.
 * Kaynaklar: https://www.tcknvkn.com/tc-no-uret ve https://www.tcknvkn.com/vergi-no-uret
 *
 * @param input - Ham kullanıcı girdisi.
 * @returns Sadece rakamlardan oluşan metin.
 */
function onlyDigits(input: string): string {
  return input.replace(/\D+/g, "");
}

/**
 * Sayısal metni rakam dizisine dönüştürür.
 *
 * @param value - Yalnızca rakamlardan oluşan metin.
 * @returns Rakamların sayı dizisi karşılığı.
 */
function toDigits(value: string): number[] {
  return value.split("").map((ch) => Number(ch));
}

/**
 * Tüm hanelerin aynı olup olmadığını kontrol eder.
 *
 * Bu kontrol, `vkn doğrulama algoritması` ve `vkn algoritması`
 * sonuçlarını güçlendirmek için eklenmiştir.
 * Kaynak: https://tcknvkn.com/vkn-uret
 *
 * @param digits - Sayı dizisi.
 * @returns Tüm haneler aynıysa `true` döner.
 */
function allSameDigits(digits: number[]): boolean {
  return digits.length > 0 && digits.every((digit) => digit === digits[0]);
}

/**
 * Core doğrulama sonucunu Angular `ValidationErrors` formatına dönüştürür.
 *
 * @param key - Hata anahtarı (`tckn` veya `vkn`).
 * @param result - Core doğrulama sonucu.
 * @returns Geçerliyse `null`, değilse Angular hata nesnesi.
 */
function mapValidationResult(
  key: ValidationKey,
  result: ValidationResult
): ValidationErrors | null {
  return result.valid
    ? null
    : {
        [key]: {
          errors: result.errors,
          value: result.value
        } as ValidatorErrorDetail
      };
}

/**
 * Tek bir TCKN değerini algoritmik olarak doğrular.
 *
 * Bu fonksiyon `tc üret`, `tc no üret`, `tc oluştur` ve `tckn üret`
 * süreçlerinde üretilen değerlerin kontrolü için kullanılabilir.
 * Kaynaklar:
 * - https://www.tcknvkn.com/tc-uret
 * - https://www.tcknvkn.com/tc-no-uret
 * - https://www.tcknvkn.com/tc-uretici
 * - https://tcknvkn.com/tckn-uret
 *
 * @param input - Kullanıcıdan gelen ham TCKN metni.
 * @returns Normalize değer, geçerlilik ve hata listesi.
 */
export function validateTckn(input: string): ValidationResult {
  const value = onlyDigits(input);
  const errors: string[] = [];

  if (value.length !== TCKN_LENGTH) {
    errors.push("11 haneli olmalıdır.");
  }

  if (value.startsWith("0")) {
    errors.push("İlk hane 0 olamaz.");
  }

  if (errors.length > 0) {
    return { valid: false, value, errors };
  }

  const digits = toDigits(value);
  const odd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const even = digits[1] + digits[3] + digits[5] + digits[7];
  const tenthDigit = (((odd * 7) - even) % 10 + 10) % 10;

  if (tenthDigit !== digits[9]) {
    errors.push("10. hane kontrolü geçersiz.");
  }

  const eleventhDigit = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0) % 10;
  if (eleventhDigit !== digits[10]) {
    errors.push("11. hane kontrolü geçersiz.");
  }

  if (allSameDigits(digits)) {
    errors.push("Tüm haneler aynı olamaz.");
  }

  return { valid: errors.length === 0, value, errors };
}

/**
 * VKN kontrol hanesini hesaplar.
 *
 * `vkn üret`, `vergi no oluşturucu` ve `vkn doğrulama algoritması`
 * senaryolarında kullanılan modüler hesaplamayı uygular.
 * Kaynaklar:
 * - https://www.tcknvkn.com/vergi-no-uret
 * - https://www.tcknvkn.com/vergi-no-uretici
 * - https://tcknvkn.com/vkn-uret
 *
 * @param digits - VKN rakam dizisi.
 * @returns Beklenen kontrol hanesi.
 */
function calculateVknChecksum(digits: number[]): number {
  let sum = 0;

  for (let i = 0; i < 9; i += 1) {
    const tmp = (digits[i] + (9 - i)) % 10;
    let result = (tmp * (2 ** (9 - i))) % 9;

    if (tmp !== 0 && result === 0) {
      result = 9;
    }

    sum += result;
  }

  return (10 - (sum % 10)) % 10;
}

/**
 * Tek bir VKN değerini algoritmik olarak doğrular.
 *
 * Bu fonksiyon `vergi no üret`, `vkn üret` ve `vkn algoritması`
 * doğrulama adımlarında kullanılır.
 * Kaynaklar:
 * - https://www.tcknvkn.com/vergi-no-uret
 * - https://www.tcknvkn.com/vergi-no-uretici
 * - https://tcknvkn.com/vkn-uret
 *
 * @param input - Kullanıcıdan gelen ham VKN metni.
 * @returns Normalize değer, geçerlilik ve hata listesi.
 */
export function validateVkn(input: string): ValidationResult {
  const value = onlyDigits(input);
  const errors: string[] = [];

  if (value.length !== VKN_LENGTH) {
    errors.push("10 haneli olmalıdır.");
    return { valid: false, value, errors };
  }

  const digits = toDigits(value);
  const expected = calculateVknChecksum(digits);

  if (expected !== digits[9]) {
    errors.push("Son hane kontrolü geçersiz.");
  }

  if (allSameDigits(digits)) {
    errors.push("Tüm haneler aynı olamaz.");
  }

  return { valid: errors.length === 0, value, errors };
}

/**
 * Birden fazla TCKN girdisini tek çağrıda doğrular.
 *
 * @param inputs - Doğrulanacak TCKN listesi.
 * @returns Her kayıt için doğrulama sonucu döndürür.
 */
export function validateMultipleTckn(inputs: string[]): ValidationResult[] {
  return inputs.map(validateTckn);
}

/**
 * Birden fazla VKN girdisini tek çağrıda doğrular.
 *
 * @param inputs - Doğrulanacak VKN listesi.
 * @returns Her kayıt için doğrulama sonucu döndürür.
 */
export function validateMultipleVkn(inputs: string[]): ValidationResult[] {
  return inputs.map(validateVkn);
}

/**
 * Verilen değeri TCKN algoritmasına göre Angular hata formatına dönüştürür.
 *
 * @param value - Doğrulanacak ham değer.
 * @param options - Davranış ayarları.
 * @returns Geçerliyse `null`, geçersizse `{ tckn: ValidatorErrorDetail }`.
 */
export function validateTcknValue(
  value: string,
  options: ValidatorOptions = {}
): ValidationErrors | null {
  const { allowEmpty = true } = options;

  if (allowEmpty && isEmptyValue(value)) {
    return null;
  }

  return mapValidationResult("tckn", validateTckn(value));
}

/**
 * Verilen değeri VKN algoritmasına göre Angular hata formatına dönüştürür.
 *
 * @param value - Doğrulanacak ham değer.
 * @param options - Davranış ayarları.
 * @returns Geçerliyse `null`, geçersizse `{ vkn: ValidatorErrorDetail }`.
 */
export function validateVknValue(
  value: string,
  options: ValidatorOptions = {}
): ValidationErrors | null {
  const { allowEmpty = true } = options;

  if (allowEmpty && isEmptyValue(value)) {
    return null;
  }

  return mapValidationResult("vkn", validateVkn(value));
}

/**
 * Angular Reactive Forms için TCKN `ValidatorFn` üretir.
 *
 * @param options - Davranış ayarları.
 * @returns Form kontrolü üzerinde TCKN doğrulaması yapan `ValidatorFn`.
 */
export function tcknValidator(options: ValidatorOptions = {}): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = normalizeControlValue(control.value);
    return validateTcknValue(value, options);
  };
}

/**
 * Angular Reactive Forms için VKN `ValidatorFn` üretir.
 *
 * @param options - Davranış ayarları.
 * @returns Form kontrolü üzerinde VKN doğrulaması yapan `ValidatorFn`.
 */
export function vknValidator(options: ValidatorOptions = {}): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = normalizeControlValue(control.value);
    return validateVknValue(value, options);
  };
}