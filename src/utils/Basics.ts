/** Null/Undefined  */
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
export const includesOne = (array: any[], ...params: any[]): boolean => {
  let res = false;
  params.forEach((param) => {
    if (array.includes(param)) res = true;
  });
  return res;
};
