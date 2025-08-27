import {
	CRLF,
	CRLF_BYTES,
	TAGGED_STRING_ENCODING_VALUE_SEPERATOR,
	TAGGED_STRING_PREFIX,
	TAGGED_STRING_SIZE_MAX,
} from '../constants.ts';
import { countDigits } from '../utils.ts';
import { NASPBaseObject } from './base.ts';
import { NASPObjectError } from './errors.ts';
import { NASPObjectType } from './types.ts';

/**
 * A NASP tagged string object
 *
 * Example usage:
 * ```typescript
 * const tagged_string = NASPTaggedString.from('hex', 'ffffff');
 * assertEquals(tagged_string.raw, new TextEncoder().encode('ffffff'))
 * assertEquals(tagged_string.objectRaw, new TextEncoder().encode('=10\r\nhex:ffffff\r\n'))
 * assertEquals(tagged_string.data, 'ffffff')
 * assertEquals(tagged_string.encoding, 'hex')
 * assertEquals(tagged_string.size, '=10\r\nhex:ffffff\r\n'.length)
 * ```
 */
export class NASPTaggedString extends NASPBaseObject {
	/** The type of the object. This will always be `NASPObjectType.TAGGED_STRING`. */
	public type: NASPObjectType = NASPObjectType.TAGGED_STRING;
	private _raw: Uint8Array;
	private _encoding: Uint8Array;

	/** The raw representation of the tagged string data */
	public get raw(): Uint8Array {
		return this._raw;
	}

	/** The encoding used for the tagged string data */
	public get encoding(): string {
		return new TextDecoder('ascii').decode(this._encoding);
	}

	/** The raw representation of the tagged string */
	public get objectRaw(): Uint8Array {
		return Uint8Array.from([
			new TextEncoder().encode(TAGGED_STRING_PREFIX),
			...new TextEncoder().encode(
				(
					this._raw.length +
					this._encoding.length +
					TAGGED_STRING_ENCODING_VALUE_SEPERATOR.length
				).toString(),
			),
			...CRLF_BYTES,
			...this._encoding,
			new TextEncoder().encode(TAGGED_STRING_ENCODING_VALUE_SEPERATOR),
			...this._raw,
			...CRLF_BYTES,
		]);
	}

	/** Data of the tagged string */
	public get data(): string {
		return new TextDecoder('ascii').decode(this._raw);
	}

	/** Size of the tagged string in bytes */
	public get size(): number {
		return (
			TAGGED_STRING_PREFIX.length +
			countDigits(
				this._raw.length +
					this._encoding.length +
					TAGGED_STRING_ENCODING_VALUE_SEPERATOR.length,
			) +
			CRLF.length +
			this._encoding.length +
			TAGGED_STRING_ENCODING_VALUE_SEPERATOR.length +
			this._raw.length +
			CRLF.length
		);
	}

	/**
	 * Creates a new NASPTaggedString object from a string
	 *
	 * @param encoding The encoding of the string
	 * @param data The string representation of the simple error
	 * @returns A new NASPTaggedString object
	 */
	public static from(encoding: string, data: string): NASPTaggedString {
		return new NASPTaggedString(
			new TextEncoder().encode(data),
			new TextEncoder().encode(encoding),
		);
	}

	/**
	 * Creates a new NASPTaggedString object from a Uint8Array
	 *
	 * @param raw The raw representation of the tagged string
	 * @param encoding The encoding of the string
	 * @returns A new NASPTaggedString object
	 * @throws {NASPObjectError} If the raw data is too large.
	 */
	constructor(raw: Uint8Array, encoding: Uint8Array) {
		if (raw.length + 4 > TAGGED_STRING_SIZE_MAX) {
			throw new NASPObjectError(
				`Tagged string size is too large, maximum size is ${TAGGED_STRING_SIZE_MAX} bytes. Received ${raw.length + 4} bytes.`,
			);
		}
		super();
		this._raw = raw;
		this._encoding = encoding;
	}
}
