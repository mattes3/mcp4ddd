/**
 * This declares a "branded" string. At runtime it's a string, nothing more.
 * At compile time, a branded string can be passed when a normal string is
 * expected, but a normal string cannot be used as a branded string.
 *
 * Also, a string with one "brand" is incompatible at compile time with a
 * string with a different brand.
 *
 * This is perfect for ID strings, use it like this:
 *
 * type CustomerID = Branded<string, 'CustomerID'>;
 * type ProductID = Branded<string, 'ProductID'>;
 *
 * This way, customer IDs cannot be confused with product IDs anymore.
 */
declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
export type Branded<T, B> = T & Brand<B>;
