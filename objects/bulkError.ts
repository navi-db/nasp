import {
	CRLF,
	BULK_SIZE_MAX,
	CRLF_BYTES,
	BULK_ERROR_PREFIX,
} from '../constants.ts';
import { countDigits } from '../utils.ts';
import { NASPBaseObject } from './base.ts';
import { NASPObjectError } from './errors.ts';
import { NASPObjectType } from './types.ts';

/**
 * A NASP bulk error object
 *
 * Example usage:
 * ```typescript
 * const bulk = NASPBulkError.from('ERR unknown command');
 * assertEquals(bulk.raw, new TextEncoder().encode('ERR unknown command'))
 * assertEquals(bulk.objectRaw, new TextEncoder().encode('!19\r\nERR unknown command\r\n'))
 * assertEquals(bulk.data, 'ERR unknown command')
 * assertEquals(bulk.size, '!19\r\nERR unknown command\r\n'.length)
 * ```
 */
export class NASPBulkError extends NASPBaseObject {
	/** The type of the object. This will always be `NASPObjectType.BULK_ERROR`. */
	public type: NASPObjectType = NASPObjectType.BULK_ERROR;
	private _raw: Uint8Array;

	/** The raw representation of the bulk error's data */
	public get raw(): Uint8Array {
		return this._raw;
	}

	/** The raw representation of the bulk error */
	public get objectRaw(): Uint8Array {
		return Uint8Array.from([
			new TextEncoder().encode(BULK_ERROR_PREFIX),
			...new TextEncoder().encode(this._raw.length.toString()),
			...CRLF_BYTES,
			...this._raw,
			...CRLF_BYTES,
		]);
	}

	/** Data of the bulk error. */
	public get data(): string {
		return new TextDecoder('ascii').decode(this._raw);
	}

	/** The size of the bulk error in bytes. */
	public get size(): number {
		return (
			BULK_ERROR_PREFIX.length +
			countDigits(this._raw.length) +
			CRLF.length +
			this._raw.length +
			CRLF.length
		);
	}

	/**
	 * Creates a new instance of NASPBulkError from a string.
	 * @param data The data to create the bulk error from.
	 * @returns A new instance of NASPBulkError.
	 */
	public static from(data: string): NASPBulkError {
		return new NASPBulkError(new TextEncoder().encode(data));
	}

	/**
	 * Creates a new instance of NASPBulkError from a Uint8Array.
	 * @param raw The raw data to create the bulk error from.
	 * @returns A new instance of NASPBulkError.
	 * @throws {NASPObjectError} If the raw data is too large.
	 */
	constructor(raw: Uint8Array) {
		if (raw.length > BULK_SIZE_MAX) {
			throw new NASPObjectError(
				`Bulk error size is too large, maximum size is ${BULK_SIZE_MAX} bytes. Received ${raw.length} bytes.`,
			);
		}
		super();
		this._raw = raw;
	}
}
