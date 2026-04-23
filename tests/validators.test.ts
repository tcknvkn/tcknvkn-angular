/**
 * @file validators.test.ts
 * @description Angular TCKN/VKN doğrulama fonksiyonları ve directive davranışları için birim testleri.
 * @created 2026-04-24
 * @license MIT
 * @see https://www.tcknvkn.com
 * @see https://www.tcknvkn.com/kutuphaneler/angular
 */
import test from "node:test";
import assert from "node:assert/strict";
import "@angular/compiler";
import { FormControl, Validators } from "@angular/forms";
import {
  TcknValidatorDirective,
  VknValidatorDirective,
  tcknValidator,
  validateMultipleTckn,
  validateMultipleVkn,
  validateTckn,
  validateTcknValue,
  validateVkn,
  validateVknValue,
  vknValidator
} from "../src/public-api";

test("validateTckn geçerli değeri normalize ederek doğrular", () => {
  const result = validateTckn("100 000 001-46");
  assert.equal(result.valid, true);
  assert.equal(result.value, "10000000146");
  assert.deepEqual(result.errors, []);
});

test("validateTckn uzunluk hatasında invalid döner", () => {
  const result = validateTckn("123");
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("11 haneli olmalıdır."));
});

test("validateTckn ilk hanesi 0 olan değeri reddeder", () => {
  const result = validateTckn("01234567890");
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("İlk hane 0 olamaz."));
});

test("validateTckn tüm haneleri aynı olan değeri reddeder", () => {
  const result = validateTckn("11111111111");
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("Tüm haneler aynı olamaz."));
});

test("validateVkn geçerli değeri doğrular", () => {
  const result = validateVkn("1000036109");
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("validateVkn son hane kontrolü hatasında invalid döner", () => {
  const result = validateVkn("1000036108");
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("Son hane kontrolü geçersiz."));
});

test("validateVkn tüm haneleri aynı olan değeri reddeder", () => {
  const result = validateVkn("1111111111");
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("Tüm haneler aynı olamaz."));
});

test("validateMultipleTckn karışık değerleri sırayı koruyarak döndürür", () => {
  const results = validateMultipleTckn(["10000000146", "123", "11111111111"]);
  assert.equal(results.length, 3);
  assert.equal(results[0].valid, true);
  assert.equal(results[1].valid, false);
  assert.equal(results[2].valid, false);
});

test("validateMultipleVkn karışık değerleri sırayı koruyarak döndürür", () => {
  const results = validateMultipleVkn(["1000036109", "123", "1111111111"]);
  assert.equal(results.length, 3);
  assert.equal(results[0].valid, true);
  assert.equal(results[1].valid, false);
  assert.equal(results[2].valid, false);
});

test("validateTcknValue allowEmpty=true iken boş değeri geçirir", () => {
  assert.equal(validateTcknValue("   "), null);
});

test("validateVknValue allowEmpty=false iken boş değerde hata döndürür", () => {
  const result = validateVknValue("   ", { allowEmpty: false });
  assert.deepEqual(result, {
    vkn: {
      errors: ["10 haneli olmalıdır."],
      value: ""
    }
  });
});

test("tcknValidator numeric kontrol değerini stringe çevirerek doğrular", () => {
  const control = new FormControl(10000000146, {
    validators: [tcknValidator({ allowEmpty: false })]
  });

  assert.equal(control.valid, true);
  assert.equal(control.errors, null);
});

test("vknValidator required ile birlikte çalışır", () => {
  const control = new FormControl("", {
    validators: [Validators.required, vknValidator({ allowEmpty: false })]
  });

  assert.equal(control.valid, false);
  assert.ok(control.errors?.["required"]);
});

test("TcknValidatorDirective allowEmpty false iken boş değerde hata döndürür", () => {
  const directive = new TcknValidatorDirective();
  directive.tcknAllowEmpty = false;

  const result = directive.validate({ value: "" } as never);
  assert.ok(result?.["tckn"]);
});

test("VknValidatorDirective input değişiminde callback'i çağırır", () => {
  const directive = new VknValidatorDirective();
  let called = 0;

  directive.registerOnValidatorChange(() => {
    called += 1;
  });

  directive.vknAllowEmpty = false;
  directive.vknAllowEmpty = true;

  assert.equal(called, 2);
});

test("VknValidatorDirective geçerli değerde hata döndürmez", () => {
  const directive = new VknValidatorDirective();
  directive.vknAllowEmpty = false;

  const result = directive.validate({ value: "1000036109" } as never);
  assert.equal(result, null);
});