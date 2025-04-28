export const argsToObject = <T extends { [k: string]: any }>(
  args: string[] = [],
  customValidation?: (key?: string, value?: string) => boolean,
  validateOnlyKeys?: string[]
): Partial<T> | null => {
  try {
    const validateKeys = Array.isArray(validateOnlyKeys)
      ? (validateOnlyKeys.every((key) => typeof key === "string") &&
          validateOnlyKeys) ||
        []
      : [];
    const validateAll = !validateKeys.length;
    const entries = args
      .filter((s) => s.trim())
      .reduce((prev, curr, i, arr) => {
        const match = curr.match(/^\-\-(.+)$/);
        const value = arr[i + 1]?.match(/^[^- ]+$/)?.[0] || "";
        if (match?.[1]?.trim()) {
          if (
            typeof customValidation === "function" &&
            (validateAll || validateKeys.includes(match[1].trim()))
          ) {
            customValidation(match[1].trim(), value) &&
              prev.push([match[1].trim(), value]);
            return prev;
          }
          prev.push([match?.[1]?.trim(), value]);
        }
        return prev;
      }, [] as string[][]);
    const data = Object.fromEntries(entries) as Partial<T>;
    return data;
  } catch (err) {
    return null;
  }
};
