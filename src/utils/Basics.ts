/** Null/Undefined  */
// is null/undefined or NaN
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isNullish = (val: any): val is undefined | null => {
  if (val === undefined || val === null) return true;
  if (typeof val === "number") if (isNaN(val)) return true;
  return false;
};

/** Number utils */
export const getDecimals = (val: number): number => {
  if (Math.floor(val) === val) return 0;
  return val.toString().split(".")[1].length || 0;
};

// Object / Array utils
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const includesOne = (array: any[], ...params: any[]): boolean => {
  let res = false;
  params.forEach((param) => {
    if (array.includes(param)) res = true;
  });
  return res;
};
