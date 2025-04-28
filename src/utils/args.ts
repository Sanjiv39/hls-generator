export const argsToObject = <T extends { [k: string]: any }>(
  args: string[] = []
): Partial<T> | null => {
  try {
    const entries = args
      .filter((s) => s.trim())
      .reduce((prev, curr, i, arr) => {
        const match = curr.match(/^\-\-(.)+$/);
        const matchNext = arr[i + 1]?.match(/^[^-]+$/);
        if (match?.[1]?.trim() && matchNext?.[0]?.trim()) {
          prev.push([match?.[1]?.trim(), matchNext?.[0]?.trim()]);
        }
        return prev;
      }, [] as string[][]);
    const data = Object.fromEntries(entries) as Partial<T>;
    return data;
  } catch (err) {
    return null;
  }
};
