import { AbstractControl } from '@angular/forms'

export function isObjectValidator(
  control: AbstractControl
): { [key: string]: any } | null {
  let valid = typeof control.value === 'object' ? true : false;
  return valid
    ? null
    : { invalidObject: { valid: false, value: control.value } }
}