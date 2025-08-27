import {
	CRLF,
	FLOAT_PREFIX,
	INTEGER_PREFIX,
	SIMPLE_ERROR_PREFIX,
	SIMPLE_STRING_PREFIX,
} from '../constants.ts';
import { NASPFloat } from '../objects/float.ts';
import { NASPInteger } from '../objects/integer.ts';
import { NASPSimpleError } from '../objects/simpleError.ts';
import { NASPSimpleString } from '../objects/simpleString.ts';

/**
 * Encodes NASP simple objects or strings and numbers into raw binary data.
 *
 * This class only provides static methods for encoding simple objects.
 */
export class NASPSimpleEncoder {
	/**
	 * Encodes a NASP simple string into raw binary data.
	 *
	 * @param object The NASP simple string to encode.
	 * @returns The raw binary data representing the NASP simple string.
	 */
	public static simple_string(object: NASPSimpleString): Uint8Array;

	/**
	 * Encodes a string into raw binary data.
	 *
	 * @param object The string to encode.
	 * @returns The raw binary data representing the NASP simple string.
	 */
	public static simple_string(object: string): Uint8Array;
	public static simple_string(object: string | NASPSimpleString): Uint8Array {
		if (object instanceof NASPSimpleString) {
			return object.objectRaw;
		}
		const data = `${SIMPLE_STRING_PREFIX}${object}${CRLF}`;
		return new TextEncoder().encode(data);
	}

	/**
	 * Encodes a NASP simple error into raw binary data.
	 *
	 * @param object The NASP simple error to encode.
	 * @returns The raw binary data representing the NASP simple error.
	 */
	public static simple_error(object: NASPSimpleError): Uint8Array;

	/**
	 * Encodes a string into raw binary data.
	 *
	 * @param object The string to encode.
	 * @returns The raw binary data representing the NASP simple error.
	 */
	public static simple_error(object: string): Uint8Array;
	public static simple_error(object: string | NASPSimpleError): Uint8Array {
		if (object instanceof NASPSimpleError) {
			return object.objectRaw;
		}
		const data = `${SIMPLE_ERROR_PREFIX}${object}${CRLF}`;
		return new TextEncoder().encode(data);
	}

	/**
	 * Encodes a NASP integer into raw binary data.
	 *
	 * @param object The NASP integer to encode.
	 * @returns The raw binary data representing the NASP integer.
	 */
	public static integer(object: NASPInteger): Uint8Array;

	/**
	 * Encodes a number into raw binary data.
	 *
	 * @param object The number to encode.
	 * @returns The raw binary data representing the NASP integer.
	 */
	public static integer(object: number): Uint8Array;

	/**
	 * Encodes a string (a representation of an integer) into raw binary data.
	 *
	 * @param object The string to encode.
	 * @returns The raw binary data representing the NASP integer.
	 */
	public static integer(object: string): Uint8Array;
	public static integer(object: string | number | NASPInteger): Uint8Array {
		if (object instanceof NASPInteger) {
			return object.objectRaw;
		}
		const data = `${INTEGER_PREFIX}${object}${CRLF}`;
		return new TextEncoder().encode(data);
	}

	/**
	 * Encodes a NASP float into raw binary data.
	 *
	 * @param object The NASP float to encode.
	 * @returns The raw binary data representing the NASP float.
	 */
	public static float(object: NASPFloat): Uint8Array;

	/**
	 * Encodes a number into raw binary data.
	 *
	 * @param object The number to encode.
	 * @returns The raw binary data representing the NASP float.
	 */
	public static float(object: number): Uint8Array;

	/**
	 * Encodes a string (a representation of a float) into raw binary data.
	 *
	 * @param object The string to encode.
	 * @returns The raw binary data representing the NASP float.
	 */
	public static float(object: string): Uint8Array;
	public static float(object: string | number | NASPFloat): Uint8Array {
		if (object instanceof NASPFloat) {
			return object.objectRaw;
		}
		const data = `${FLOAT_PREFIX}${object}${CRLF}`;
		return new TextEncoder().encode(data);
	}
}
