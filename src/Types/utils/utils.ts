export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];
export type ExcludeEmpty<T> = T extends AtLeastOne<T> ? T : never;
