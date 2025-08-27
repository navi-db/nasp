import {
	ARRAY_PREFIX,
	BULK_ERROR_PREFIX,
	BULK_STRING_PREFIX,
	CRLF,
	TAGGED_STRING_PREFIX,
} from '../constants.ts';
import type { NASPArray } from '../objects/array.ts';
import { NASPBulkError } from '../objects/bulkError.ts';
import { NASPBulkString } from '../objects/bulkString.ts';
import { NASPCommand } from '../objects/command.ts';
import { NASPTaggedString } from '../objects/taggedString.ts';

/**
 * Encodes NASP aggregate/complex objects or strings and array of strings into raw binary data.
 *
 * This class only provides static methods for encoding aggregate/complex objects.
 */
export class NASPAggregateEncoder {
	/**
	 * Encodes a NASP bulk string into raw binary data.
	 *
	 * @param object The NASP bulk string to encode.
	 * @returns The raw binary data representing the NASP bulk string.
	 */
	public static bulk_string(object: NASPBulkString): Uint8Array;

	/**
	 * Encodes a string into raw binary data.
	 *
	 * @param object The string to encode.
	 * @returns The raw binary data representing the NASP bulk string.
	 */
	public static bulk_string(object: string): Uint8Array;
	public static bulk_string(object: string | NASPBulkString): Uint8Array {
		if (object instanceof NASPBulkString) {
			return object.objectRaw;
		}
		const data = `${BULK_STRING_PREFIX}${object.length}${CRLF}${object}${CRLF}`;
		return new TextEncoder().encode(data);
	}

	/**
	 * Encodes a NASP bulk error into raw binary data.
	 *
	 * @param object The NASP bulk error to encode.
	 * @returns The raw binary data representing the NASP bulk error.
	 */
	public static bulk_error(object: NASPBulkError): Uint8Array;

	/**
	 * Encodes a string into raw binary data.
	 *
	 * @param object The string to encode.
	 * @returns The raw binary data representing the NASP bulk error.
	 */
	public static bulk_error(object: string): Uint8Array;
	public static bulk_error(object: string | NASPBulkError): Uint8Array {
		if (object instanceof NASPBulkError) {
			return object.objectRaw;
		}
		const data = `${BULK_ERROR_PREFIX}${object.length}${CRLF}${object}${CRLF}`;
		return new TextEncoder().encode(data);
	}

	/**
	 * Encodes a NASP tagged string into raw binary data.
	 *
	 * @param object The NASP tagged string to encode.
	 * @returns The raw binary data representing the NASP tagged string.
	 */
	public static tagged_string(object: NASPTaggedString): Uint8Array;

	/**
	 * Encodes an object containing the encoding and the data (as strings) into raw binary data.
	 *
	 * @param object The object of strings to encode.
	 * @returns The raw binary data representing the NASP tagged string.
	 */
	public static tagged_string(object: {
		encoding: string;
		data: string;
	}): Uint8Array;
	public static tagged_string(
		object: { encoding: string; data: string } | NASPTaggedString,
	): Uint8Array {
		if (object instanceof NASPTaggedString) {
			return object.objectRaw;
		}
		const data = `${TAGGED_STRING_PREFIX}${object.encoding.length + object.data.length + 1}${CRLF}${object.encoding}:${object.data}${CRLF}`;
		return new TextEncoder().encode(data);
	}

	/**
	 * Encodes a NASP array into raw binary data.
	 *
	 * @param object The NASP array to encode.
	 * @returns The raw binary data representing the NASP array.
	 */
	public static array(object: NASPArray): Uint8Array {
		return object.objectRaw;
	}

	/**
	 * Encodes a NASP command into raw binary data.
	 *
	 * @param object The NASP command to encode.
	 * @returns The raw binary data representing the NASP command.
	 */
	public static command(object: NASPCommand): Uint8Array;

	/**
	 * Encodes an array of strings into raw binary data where the first (and optionally the second) string is a command name.
	 *
	 * @param object The array of strings to encode as NASP bulk strings.
	 * @returns The raw binary data representing the NASP array of bulk strings.
	 */
	public static command(object: string[]): Uint8Array;
	public static command(object: string[] | NASPCommand): Uint8Array {
		if (object instanceof NASPCommand) {
			return object.objectRaw;
		}
		const data = `${ARRAY_PREFIX}${object.length}${CRLF}${object.map((obj) => this.bulk_string(obj)).join()}`;
		return new TextEncoder().encode(data);
	}
}
