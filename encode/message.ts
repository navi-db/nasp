import { CRLF } from '../constants.ts';
import type { NASPRequest, NASPResponse } from '../objects/messages.ts';

/**
 * Encodes NASP messages into raw binary data.
 *
 * This class only provides static methods for encoding aggregate/complex objects.
 */

export class NASPMessageEncoder {
	/**
	 * Encodes a NASP request into raw binary data.
	 *
	 * @param object The NASP request to encode.
	 * @returns The raw binary data representing the NASP request.
	 */
	public static request(object: NASPRequest): Uint8Array {
		let data = '';
		if (object.body) {
			const body = new TextDecoder().decode(object.body.objectRaw);
			data = `REQ${CRLF}${object.id}${CRLF}${object.payload.data}${CRLF}${body}`;
		} else {
			data = `REQ${CRLF}${object.id}${CRLF}${object.payload.data}${CRLF}`;
		}
		return new TextEncoder().encode(data);
	}

	/**
	 * Encodes a NASP response into raw binary data.
	 *
	 * @param object The NASP response to encode.
	 * @returns The raw binary data representing the NASP response.
	 */
	public static response(object: NASPResponse): Uint8Array {
		let data = '';
		if (object.body) {
			const body = new TextDecoder().decode(object.body.objectRaw);
			data = `RES${CRLF}${object.id}${CRLF}${object.payload.data}${CRLF}${body}`;
		} else {
			data = `RES${CRLF}${object.id}${CRLF}${object.payload.data}${CRLF}`;
		}
		return new TextEncoder().encode(data);
	}
}
