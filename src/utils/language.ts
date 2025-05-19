export const getLanguage = (code: string) => {
  try {
    if (typeof code !== "string" || code.trim().length < 2) {
      throw new Error("Language code required, min 2 letters");
    }
    const data = {
      original: code.trim(),
      code: code.trim().toLowerCase(),
      language: "" as string | undefined,
    };
    data.language = new Intl.DisplayNames([data.code], { type: "language" }).of(
      data.code
    );
    return data;
  } catch (err) {
    return null;
  }
};
