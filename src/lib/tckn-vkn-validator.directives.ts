/**
 * @file tckn-vkn-validator.directives.ts
 * @description Angular template-driven formlar için TCKN/VKN validator directive sınıfları.
 * @created 2026-04-24
 * @license MIT
 * @see https://www.tcknvkn.com
 * @see https://www.tcknvkn.com/kutuphaneler/angular
 */
import { Directive, Input, booleanAttribute, forwardRef } from "@angular/core";
import type { AbstractControl, ValidationErrors, Validator } from "@angular/forms";
import { NG_VALIDATORS } from "@angular/forms";
import { validateTcknValue, validateVknValue } from "./tckn-vkn.validators";

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
 * Template-driven formlarda `tcknValidator` niteliği ile TCKN doğrulaması yapar.
 */
@Directive({
  selector: "[tcknValidator][formControlName],[tcknValidator][formControl],[tcknValidator][ngModel]",
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TcknValidatorDirective),
      multi: true
    }
  ]
})
export class TcknValidatorDirective implements Validator {
  private allowEmpty = true;

  private onValidatorChange?: () => void;

  /**
   * Boş değerlerin geçerli kabul edilip edilmeyeceğini belirler.
   */
  @Input({ transform: booleanAttribute })
  set tcknAllowEmpty(value: boolean) {
    this.allowEmpty = value;
    this.onValidatorChange?.();
  }

  /**
   * Mevcut `allowEmpty` ayarını döndürür.
   */
  get tcknAllowEmpty(): boolean {
    return this.allowEmpty;
  }

  /**
   * Angular forms yaşam döngüsünde kontrol değeri değiştikçe çalışır.
   *
   * @param control - Doğrulanacak kontrol nesnesi.
   * @returns Geçerliyse `null`, geçersizse hata nesnesi.
   */
  validate(control: AbstractControl): ValidationErrors | null {
    return validateTcknValue(normalizeControlValue(control.value), {
      allowEmpty: this.allowEmpty
    });
  }

  /**
   * `@Input` değişiminde doğrulamanın tekrar tetiklenebilmesi için callback kaydeder.
   *
   * @param fn - Validator yeniden değerlendirme callback'i.
   */
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }
}

/**
 * Template-driven formlarda `vknValidator` niteliği ile VKN doğrulaması yapar.
 */
@Directive({
  selector: "[vknValidator][formControlName],[vknValidator][formControl],[vknValidator][ngModel]",
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => VknValidatorDirective),
      multi: true
    }
  ]
})
export class VknValidatorDirective implements Validator {
  private allowEmpty = true;

  private onValidatorChange?: () => void;

  /**
   * Boş değerlerin geçerli kabul edilip edilmeyeceğini belirler.
   */
  @Input({ transform: booleanAttribute })
  set vknAllowEmpty(value: boolean) {
    this.allowEmpty = value;
    this.onValidatorChange?.();
  }

  /**
   * Mevcut `allowEmpty` ayarını döndürür.
   */
  get vknAllowEmpty(): boolean {
    return this.allowEmpty;
  }

  /**
   * Angular forms yaşam döngüsünde kontrol değeri değiştikçe çalışır.
   *
   * @param control - Doğrulanacak kontrol nesnesi.
   * @returns Geçerliyse `null`, geçersizse hata nesnesi.
   */
  validate(control: AbstractControl): ValidationErrors | null {
    return validateVknValue(normalizeControlValue(control.value), {
      allowEmpty: this.allowEmpty
    });
  }

  /**
   * `@Input` değişiminde doğrulamanın tekrar tetiklenebilmesi için callback kaydeder.
   *
   * @param fn - Validator yeniden değerlendirme callback'i.
   */
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }
}