import { CRLF, CRLF_BYTES, FLOAT_PREFIX } from '../constants.ts';
import { NASPBaseObject } from './base.ts';
import { NASPObjectError } from './errors.ts';
import { NASPObjectType } from './types.ts';

/**
 * A NASP float object
 *
 * Example usage:
 * ```typescript
 * const float = NASPFloat.from(123.456);
 * assertEquals(float.raw, new TextEncoder().encode('123.456'))
 * assertEquals(float.objectRaw, new TextEncoder().encode(';123.456\r\n'))
 * assertEquals(float.data, 123.456)
 * assertEquals(float.size, ';123.456\r\n'.length)
 * ```
 */
export class NASPFloat extends NASPBaseObject {
	/** The type of the object. This will always be `NASPObjectType.FLOAT`. */
	public type: NASPObjectType = NASPObjectType.FLOAT;
	private _raw: Uint8Array;

	/** The raw representation of the float data */
	public get raw(): Uint8Array {
		return this._raw;
	}

	/** The raw representation of the float */
	public get objectRaw(): Uint8Array {
		return Uint8Array.from([
			new TextEncoder().encode(FLOAT_PREFIX),
			...this._raw,
			...CRLF_BYTES,
		]);
	}

	/** Data of the float */
	public get data(): number {
		return parseFloat(new TextDecoder().decode(this._raw));
	}

	/** Size of the float object in bytes */
	public get size(): number {
		return FLOAT_PREFIX.length + this._raw.length + CRLF.length;
	}

	/**
	 * Creates a new NASPFloat object from a string (a representation of a float)
	 *
	 * @param data The string representation of the float
	 * @returns A new NASPFloat object
	 */
	public static from(data: string): NASPFloat;

	/**
	 * Creates a new NASPFloat object from a number
	 *
	 * @param data The number representation of the float
	 * @returns A new NASPFloat object
	 */
	public static from(data: number): NASPFloat;
	public static from(data: string | number): NASPFloat {
		if (typeof data === 'string') {
			return new NASPFloat(new TextEncoder().encode(data));
		}
		return new NASPFloat(new TextEncoder().encode(data.toString()));
	}

	/**
	 * Creates a new NASPFloat object from a Uint8Array
	 *
	 * @param raw The raw representation of the float
	 * @returns A new NASPFloat object
	 * @throws {NASPObjectError} If the raw data is not a valid float representation
	 */
	constructor(raw: Uint8Array) {
		const float = parseFloat(new TextDecoder().decode(raw));
		if (float > Number.MAX_VALUE) {
			throw new NASPObjectError(
				'Float value exceeds maximum safe integer',
			);
		}
		super();
		this._raw = raw;
	}
}
