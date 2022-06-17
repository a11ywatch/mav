// remove base64 and just get data
export const base64Replacer = (base: string) => {
  if (base.startsWith("data:image/png;base64,")) {
    base = base.replace(/^data:image\/png;base64,/, "");
  }
  if (base.startsWith("data:image/jpg;base64,")) {
    base = base.replace(/^data:image\/jpg;base64,/, "");
  }
  if (base.startsWith("data:image/jpeg;base64,")) {
    base = base.replace(/^data:image\/jpg;base64,/, "");
  }
  if (base.startsWith("data:image/tif;base64,")) {
    base = base.replace(/^data:image\/jpg;base64,/, "");
  }
  if (base.startsWith("data:image/svg;base64,")) {
    base = base.replace(/^data:image\/jpg;base64,/, "");
  }
  if (base.startsWith("data:image/gif;base64,")) {
    base = base.replace(/^data:image\/jpg;base64,/, "");
  }
  return base;
};
