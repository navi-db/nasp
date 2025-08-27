import {
	CRLF,
	BULK_SIZE_MAX,
	CRLF_BYTES,
	BULK_STRING_PREFIX,
} from '../constants.ts';
import { countDigits } from '../utils.ts';
import { NASPBaseObject } from './base.ts';
import { NASPObjectError } from './errors.ts';
import { NASPObjectType } from './types.ts';

/**
 * A NASP bulk string object
 *
 * Example usage:
 * ```typescript
 * const bulk = NASPBulkString.from('apple');
 * assertEquals(bulk.raw, new TextEncoder().encode('apple'))
 * assertEquals(bulk.objectRaw, new TextEncoder().encode('!5\r\napple\r\n'))
 * assertEquals(bulk.data, 'apple')
 * assertEquals(bulk.size, '!5\r\napple\r\n'.length)
 * ```
 */
export class NASPBulkString extends NASPBaseObject {
	/** The type of the object. This will always be `NASPObjectType.BULK_STRING`. */
	public type: NASPObjectType = NASPObjectType.BULK_STRING;
	private _raw: Uint8Array;

	/** The raw representation of the bulk string's data */
	public get raw(): Uint8Array {
		return this._raw;
	}

	/** The raw representation of the bulk string */
	public get objectRaw(): Uint8Array {
		return Uint8Array.from([
			new TextEncoder().encode(BULK_STRING_PREFIX),
			...new TextEncoder().encode(this._raw.length.toString()),
			...CRLF_BYTES,
			...this._raw,
			...CRLF_BYTES,
		]);
	}

	/** Data of the bulk string. */
	public get data(): string {
		return new TextDecoder('ascii').decode(this._raw);
	}

	/** The size of the bulk string in bytes. */
	public get size(): number {
		return (
			BULK_STRING_PREFIX.length +
			countDigits(this._raw.length) +
			CRLF.length +
			this._raw.length +
			CRLF.length
		);
	}

	/**
	 * Creates a new instance of NASPBulkString from a string.
	 * @param data The data to create the bulk string from.
	 * @returns A new instance of NASPBulkString.
	 */
	public static from(data: string): NASPBulkString {
		return new NASPBulkString(new TextEncoder().encode(data));
	}

	/**
	 * Creates a new instance of NASPBulkString from a Uint8Array.
	 * @param raw The raw data to create the bulk string from.
	 * @returns A new instance of NASPBulkString.
	 * @throws {NASPObjectError} If the raw data is too large.
	 */
	constructor(raw: Uint8Array) {
		if (raw.length > BULK_SIZE_MAX) {
			throw new NASPObjectError(
				`Bulk string size is too large, maximum size is ${BULK_SIZE_MAX} bytes. Received ${raw.length} bytes.`,
			);
		}
		super();
		this._raw = raw;
	}
}
