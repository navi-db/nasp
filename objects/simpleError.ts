import {
	CRLF,
	CRLF_BYTES,
	SIMPLE_ERROR_PREFIX,
	SIMPLE_SIZE_MAX,
} from '../constants.ts';
import { NASPBaseObject } from './base.ts';
import { NASPObjectError } from './errors.ts';
import { NASPObjectType } from './types.ts';

/**
 * A NASP simple error object
 *
 * Example usage:
 * ```typescript
 * const simple = NASPSimpleError.from('ERR');
 * assertEquals(simple.raw, new TextEncoder().encode('ERR'))
 * assertEquals(simple.objectRaw, new TextEncoder().encode('-ERR\r\n'))
 * assertEquals(simple.data, 'ERR')
 * assertEquals(simple.size, '-ERR\r\n'.length)
 * ```
 */
export class NASPSimpleError extends NASPBaseObject {
	/** The type of the object. This will always be `NASPObjectType.SIMPLE_ERROR`. */
	public type: NASPObjectType = NASPObjectType.SIMPLE_ERROR;
	private _raw: Uint8Array;

	/** The raw representation of the simple error data */
	public get raw(): Uint8Array {
		return this._raw;
	}

	/** The raw representation of the simple error */
	public get objectRaw(): Uint8Array {
		return Uint8Array.from([
			new TextEncoder().encode(SIMPLE_ERROR_PREFIX),
			...this._raw,
			...CRLF_BYTES,
		]);
	}

	/** Data of the simple error */
	public get data(): string {
		return new TextDecoder('ascii').decode(this._raw);
	}

	/** Size of the simple error in bytes */
	public get size(): number {
		return SIMPLE_ERROR_PREFIX.length + this._raw.length + CRLF.length;
	}

	/**
	 * Creates a new NASPSimpleError object from a string
	 *
	 * @param data The string representation of the simple error
	 * @returns A new NASPSimpleError object
	 */
	public static from(data: string): NASPSimpleError {
		return new NASPSimpleError(new TextEncoder().encode(data));
	}

	/**
	 * Creates a new NASPSimpleError object from a Uint8Array
	 *
	 * @param raw The raw representation of the simple error
	 * @returns A new NASPSimpleError object
	 * @throws {NASPObjectError} If the raw data is too large.
	 */
	constructor(raw: Uint8Array) {
		if (raw.length > SIMPLE_SIZE_MAX) {
			throw new NASPObjectError(
				`Simple error size is too large, maximum size is ${SIMPLE_SIZE_MAX} bytes. Received ${raw.length} bytes.`,
			);
		}
		super();
		this._raw = raw;
	}
}
