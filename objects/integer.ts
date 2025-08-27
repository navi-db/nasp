import { CRLF, CRLF_BYTES, INTEGER_PREFIX } from '../constants.ts';
import { NASPBaseObject } from './base.ts';
import { NASPObjectError } from './errors.ts';
import { NASPObjectType } from './types.ts';

/**
 * A NASP integer object
 *
 * Example usage:
 * ```typescript
 * const integer = NASPInteger.from(123);
 * assertEquals(integer.raw, new TextEncoder().encode('123'))
 * assertEquals(integer.objectRaw, new TextEncoder().encode(':123\r\n'))
 * assertEquals(integer.data, 123)
 * assertEquals(integer.size, ':123\r\n'.length)
 * ```
 */
export class NASPInteger extends NASPBaseObject {
	/** The type of the object. This will always be `NASPObjectType.INTEGER`. */
	public type: NASPObjectType = NASPObjectType.INTEGER;
	private _raw: Uint8Array;

	/** The raw representation of the integer data */
	public get raw(): Uint8Array {
		return this._raw;
	}

	/** The raw representation of the integer */
	public get objectRaw(): Uint8Array {
		return Uint8Array.from([
			new TextEncoder().encode(INTEGER_PREFIX),
			...this._raw,
			...CRLF_BYTES,
		]);
	}

	/** Data of the integer */
	public get data(): number {
		return parseInt(new TextDecoder().decode(this._raw), 10);
	}

	/** Size of the integer in bytes */
	public get size(): number {
		return INTEGER_PREFIX.length + this._raw.length + CRLF.length;
	}

	/**
	 * Creates a new NASPInteger object from a string (a representation of an integer)
	 *
	 * @param data The string representation of the integer
	 * @returns A new NASPInteger object
	 */
	public static from(data: string): NASPInteger;

	/**
	 * Creates a new NASPInteger object from a number
	 *
	 * @param data The number representation of the integer
	 * @returns A new NASPInteger object
	 */
	public static from(data: number): NASPInteger;
	public static from(data: string | number): NASPInteger {
		if (typeof data === 'string') {
			return new NASPInteger(new TextEncoder().encode(data));
		}
		return new NASPInteger(new TextEncoder().encode(data.toString()));
	}

	/**
	 * Creates a new NASPInteger object from a Uint8Array
	 *
	 * @param raw The raw representation of the integer
	 * @returns A new NASPInteger object
	 * @throws {NASPObjectError} If the integer value exceeds the maximum safe integer
	 */
	constructor(raw: Uint8Array) {
		const int = parseInt(new TextDecoder().decode(raw), 10);
		if (int > Number.MAX_SAFE_INTEGER) {
			throw new NASPObjectError(
				'Integer value exceeds maximum safe integer',
			);
		}
		super();
		this._raw = raw;
	}
}
