export type ValidateNumberOptions<D extends any = number> = Partial<{
  /**
   * @description Default value returned if validation failed.
   * @default 0
   */
  defaultValue: any;
  /**
   * @description Should validate as not NAN.
   * @default true
   */
  validateNaN: boolean;
  /**
   * @description Should validate as finite number.
   * @default true
   */
  validateFinite: boolean;
  /**
   * @description Should validate as greater than 0.
   * @default true
   */
  validateCountale: boolean;
  /**
   * @description Customized validation. Executes after all generic validations
   * @default undefined
   */
  customValidation: (value: number) => number | undefined;
}>;
export const validateNumber = <D extends any = number>(
  value: any,
  options?: ValidateNumberOptions
): number | D => {
  const allOptions: ValidateNumberOptions<D> = {
    validateNaN: true,
    validateFinite: true,
    validateCountale: true,
    defaultValue: 0,
    ...options,
  };
  try {
    if (typeof value !== "number") {
      return allOptions.defaultValue;
    }
    if (allOptions.validateNaN && Number.isNaN(value)) {
      return allOptions.defaultValue;
    }
    if (allOptions.validateFinite && !Number.isFinite(value)) {
      return allOptions.defaultValue;
    }
    if (allOptions.validateCountale && value <= 0) {
      return allOptions.defaultValue;
    }
    if (typeof allOptions.customValidation === "function") {
      value = allOptions.customValidation(value);
    }
    return value as number;
  } catch (err) {
    return allOptions.defaultValue;
  }
};
