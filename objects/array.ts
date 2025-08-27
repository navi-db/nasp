import {
	ARRAY_LENGTH_MAX,
	ARRAY_PREFIX,
	ARRAY_SIZE_MAX,
	CRLF,
	CRLF_BYTES,
} from '../constants.ts';
import { countDigits } from '../utils.ts';
import { NASPBaseObject } from './base.ts';
import { NASPBulkError } from './bulkError.ts';
import { NASPBulkString } from './bulkString.ts';
import { NASPObjectError } from './errors.ts';
import { NASPSimpleError } from './simpleError.ts';
import { NASPSimpleString } from './simpleString.ts';
import { type NASPObject, NASPObjectType } from './types.ts';

/**
 * A NASP array object
 *
 * Example usage:
 * ```typescript
 * const array = NASPArray.from_simple_str('OK', 'PONG');
 * assertEquals(array.raw, new TextEncoder().encode('+OK\r\n+PONG\r\n'))
 * assertEquals(array.objectRaw, new TextEncoder().encode('*2\r\n+OK\r\n+PONG\r\n'))
 * assertEquals(array.data, [NASPSimpleString.from('OK'), NASPSimpleString.from('PONG')])
 * assertEquals(array.size, '*2\r\n+OK\r\n+PONG\r\n'.length)
 * ```
 */
export class NASPArray extends NASPBaseObject {
	/** The type of the object. This will always be `NASPObjectType.ARRAY`. */
	public type: NASPObjectType = NASPObjectType.ARRAY;

	private _raw: Uint8Array;

	private _objects: NASPObject[];

	/** The raw representation of the array's values */
	public get raw(): Uint8Array {
		return this._raw;
	}

	/** Raw representation of the array. */
	public get objectRaw(): Uint8Array {
		return Uint8Array.from([
			new TextEncoder().encode(ARRAY_PREFIX),
			...new TextEncoder().encode(this._objects.length.toString()),
			...CRLF_BYTES,
			...this._raw,
		]);
	}

	/** The array's values as an array of NASPObject instances */
	public get data(): NASPObject[] {
		return this._objects;
	}

	/** The size of the array in bytes */
	public get size(): number {
		return (
			ARRAY_PREFIX.length +
			countDigits(this._raw.length) +
			CRLF.length +
			this._raw.length +
			CRLF.length
		);
	}

	/**
	 * Create a new array of simple strings from a list of strings
	 * @param data - The list of strings to create the array from.
	 * @returns A new instance of NASPArray.
	 */
	public static from_simple_str(...data: string[]): NASPArray {
		return new NASPArray(
			data.map((simple) => NASPSimpleString.from(simple)),
		);
	}

	/**
	 * Create a new array of simple errors from a list of strings
	 * @param data - The list of strings to create the array from.
	 * @returns A new instance of NASPArray.
	 */
	public static from_simple_err(...data: string[]): NASPArray {
		return new NASPArray(
			data.map((simple) => NASPSimpleError.from(simple)),
		);
	}

	/**
	 * Create a new array of bulk strings from a list of strings
	 * @param data - The list of strings to create the array from.
	 * @returns A new instance of NASPArray.
	 */
	public static from_bulk_str(...data: string[]): NASPArray {
		return new NASPArray(data.map((bulk) => NASPBulkString.from(bulk)));
	}

	/**
	 * Create a new array of bulk errors from a list of strings
	 * @param data - The list of strings to create the array from.
	 * @returns A new instance of NASPArray.
	 */
	public static from_bulk_err(...data: string[]): NASPArray {
		return new NASPArray(data.map((bulk) => NASPBulkError.from(bulk)));
	}

	/**
	 * Creates a new instance of NASPArray from a list of NASPObject instances.
	 *
	 * @param objects - The list of NASPObject instances to create the array from.
	 * @throws {NASPObjectError} If the array size is too large, or if the array is too long.
	 */
	constructor(objects: NASPObject[]) {
		const raw = new Uint8Array(
			objects
				.map((obj) => obj.objectRaw)
				.reduce((acc, curr) => {
					const result = new Uint8Array(acc.length + curr.length);
					result.set(acc);
					result.set(curr, acc.length);
					return result;
				}, new Uint8Array(0)),
		);
		const rawLength =
			ARRAY_PREFIX.length +
			countDigits(raw.length) +
			CRLF.length +
			raw.length +
			CRLF.length;
		if (rawLength > ARRAY_SIZE_MAX) {
			throw new NASPObjectError(
				`Array size is too large, maximum size is ${ARRAY_SIZE_MAX} bytes. Received ${raw.length} bytes.`,
			);
		}
		if (objects.length > ARRAY_LENGTH_MAX) {
			throw new NASPObjectError(
				`Array length is too large, maximum length is ${ARRAY_LENGTH_MAX}. Received ${objects.length} items.`,
			);
		}
		super();
		this._objects = objects;
		this._raw = raw;
	}
}
