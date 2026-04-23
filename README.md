# @tcknvkn/angular

`@tcknvkn/angular`, Angular projelerinde **TCKN (TC Kimlik No)** ve **VKN (Vergi Kimlik No)** doğrulama işlemleri için hazırlanmış hafif bir validator kütüphanesidir.

Bu paket yalnızca **algoritmik/format doğrulaması** yapar. Nüfus veya vergi servislerinden kimlik sahibine ait gerçek doğrulama yapmaz.

## Kurulum

```bash
npm install @tcknvkn/angular
```

## Neden Bu Kütüphane?

- Angular Reactive Forms ve template-driven forms desteği
- TCKN validator ve VKN validator fonksiyonları
- Ham değer doğrulama (`validateTckn`, `validateVkn`)
- Toplu doğrulama (`validateMultipleTckn`, `validateMultipleVkn`)
- TypeScript ile güçlü tip desteği
- Sunucu çağrısı olmadan hızlı istemci tarafı doğrulama

## Hızlı Kullanım

### Reactive Forms

```typescript
import { FormControl, Validators } from "@angular/forms";
import { tcknValidator, vknValidator } from "@tcknvkn/angular";

const tcknControl = new FormControl("", {
  validators: [Validators.required, tcknValidator({ allowEmpty: false })]
});

const vknControl = new FormControl("", {
  validators: [vknValidator()]
});
```

### Template-Driven Forms

```typescript
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TcknValidatorDirective, VknValidatorDirective } from "@tcknvkn/angular";

@Component({
  standalone: true,
  selector: "app-root",
  imports: [FormsModule, TcknValidatorDirective, VknValidatorDirective],
  template: `
    <input name="tckn" ngModel tcknValidator />
    <input name="vkn" ngModel vknValidator />
  `
})
export class AppComponent {}
```

## API Referansı

### `validateTckn(input: string): ValidationResult`
Verilen değeri normalize ederek (yalnızca rakamları alır) TCKN algoritmasına göre doğrular.

### `validateVkn(input: string): ValidationResult`
Verilen değeri normalize ederek VKN algoritmasına göre doğrular.

### `validateMultipleTckn(inputs: string[]): ValidationResult[]`
Birden fazla TCKN değerini tek çağrıda doğrular.

### `validateMultipleVkn(inputs: string[]): ValidationResult[]`
Birden fazla VKN değerini tek çağrıda doğrular.

### `validateTcknValue(value: string, options?: ValidatorOptions): ValidationErrors | null`
Angular form hata formatında TCKN sonucu döndürür.

### `validateVknValue(value: string, options?: ValidatorOptions): ValidationErrors | null`
Angular form hata formatında VKN sonucu döndürür.

### `tcknValidator(options?: ValidatorOptions): ValidatorFn`
Reactive Forms için TCKN validator üretir.

### `vknValidator(options?: ValidatorOptions): ValidatorFn`
Reactive Forms için VKN validator üretir.

### `TcknValidatorDirective` / `VknValidatorDirective`
Template-driven form kullanımında doğrudan HTML üzerinde doğrulama sağlar.

## Hata Formatı

TCKN için:

```typescript
{
  tckn: {
    errors: string[];
    value: string;
  }
}
```

VKN için:

```typescript
{
  vkn: {
    errors: string[];
    value: string;
  }
}
```

## Test ve Build

```bash
npm ci
npm test
npm run build
```

## İlgili Bağlantılar

- Kütüphaneler: https://www.tcknvkn.com/kutuphaneler
- Angular kütüphane sayfası: https://www.tcknvkn.com/kutuphaneler/angular
- TC üret: https://www.tcknvkn.com/tc-uret
- TC no üret: https://www.tcknvkn.com/tc-no-uret
- TC üretici: https://www.tcknvkn.com/tc-uretici
- TCKN üret: https://tcknvkn.com/tckn-uret
- Vergi no üret: https://www.tcknvkn.com/vergi-no-uret
- Vergi no üretici: https://www.tcknvkn.com/vergi-no-uretici
- VKN üret: https://tcknvkn.com/vkn-uret

## Lisans

MIT
