import {
	CRLF,
	CRLF_BYTES,
	SIMPLE_SIZE_MAX,
	SIMPLE_STRING_PREFIX,
} from '../constants.ts';
import { NASPBaseObject } from './base.ts';
import { NASPObjectError } from './errors.ts';
import { NASPObjectType } from './types.ts';

/**
 * A NASP simple string object
 *
 * Example usage:
 * ```typescript
 * const simple = NASPSimpleString.from('PONG');
 * assertEquals(simple.raw, new TextEncoder().encode('PONG'))
 * assertEquals(simple.objectRaw, new TextEncoder().encode('+PONG\r\n'))
 * assertEquals(simple.data, 'PONG')
 * assertEquals(simple.size, '+PONG\r\n'.length)
 * ```
 */
export class NASPSimpleString extends NASPBaseObject {
	/** The type of the object. This will always be `NASPObjectType.SIMPLE_STRING`. */
	public type: NASPObjectType = NASPObjectType.SIMPLE_STRING;
	private _raw: Uint8Array;

	/** The raw representation of the simple string data */
	public get raw(): Uint8Array {
		return this._raw;
	}

	/** The raw representation of the simple string */
	public get objectRaw(): Uint8Array {
		return Uint8Array.from([
			new TextEncoder().encode(SIMPLE_STRING_PREFIX),
			...this._raw,
			...CRLF_BYTES,
		]);
	}

	/** Data of the simple string */
	public get data(): string {
		return new TextDecoder('ascii').decode(this._raw);
	}

	/** Size of the simple string in bytes */
	public get size(): number {
		return SIMPLE_STRING_PREFIX.length + this._raw.length + CRLF.length;
	}

	/**
	 * Creates a new NASPSimpleError object from a string
	 *
	 * @param data The string representation of the simple string
	 * @returns A new NASPSimpleString object
	 */
	public static from(data: string): NASPSimpleString {
		return new NASPSimpleString(new TextEncoder().encode(data));
	}

	/**
	 * Creates a new NASPSimpleString object from a Uint8Array
	 *
	 * @param raw The raw representation of the simple string
	 * @returns A new NASPSimpleString object
	 * @throws {NASPObjectError} If the raw data is too large.
	 */
	constructor(raw: Uint8Array) {
		if (raw.length > SIMPLE_SIZE_MAX) {
			throw new NASPObjectError(
				`Simple string size is too large, maximum size is ${SIMPLE_SIZE_MAX} bytes. Received ${raw.length} bytes.`,
			);
		}
		super();
		this._raw = raw;
	}
}
