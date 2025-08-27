import {
	NASPCommandName,
	type NASPObject,
	NASPObjectType,
	NASPPayloadKind,
} from '../objects/types.ts';
import { Result } from '@sapphire/result';
import { equals as bytesEqual } from '@std/bytes';
import { NASPDecodeError } from './errors.ts';
import { NASPSimpleString } from '../objects/simpleString.ts';
import { NASPSimpleError } from '../objects/simpleError.ts';
import { NASPInteger } from '../objects/integer.ts';
import { NASPFloat } from '../objects/float.ts';
import { NASPBulkString } from '../objects/bulkString.ts';
import { NASPBulkError } from '../objects/bulkError.ts';
import { NASPTaggedString } from '../objects/taggedString.ts';
import { NASPArray } from '../objects/array.ts';
import { NASPCommand } from '../objects/command.ts';
import { NASPPayload, NASPRequest, NASPResponse } from '../objects/messages.ts';
import {
	ARRAY_PREFIX,
	BULK_ERROR_PREFIX,
	BULK_STRING_PREFIX,
	CRLF_BYTES,
	FLOAT_PREFIX,
	INTEGER_PREFIX,
	SIMPLE_ERROR_PREFIX,
	SIMPLE_STRING_PREFIX,
	TAGGED_STRING_ENCODING_LENGTH,
	TAGGED_STRING_ENCODING_VALUE_SEPERATOR,
	TAGGED_STRING_PREFIX,
} from '../constants.ts';

/**
 * Decodes NASP-encoded messages from raw binary data.
 *
 * This class reads a `Uint8Array` buffer and attempts to parse it into either a {@link NASPRequest} or {@link NASPResponse},
 * returning a {@link Result} that indicates a success or an {@link NASPDecodeError}.
 *
 * Example usage:
 * ```typescript
 * const rawData = new TextEncoder().encode('REQ\r\n1\r\nPING\r\n);
 * const decoder = new NASPDecoder(rawData);
 * const result = decoder.decode();
 * if (result.isOk()) {
 * 		const request = result.unwrap();
 * 		assertEquals(request.kind, NASPMessageKind.REQUEST);
 * } else {
 * 		const error = result.unwrapErr();
 * 		console.error(error);
 * }
 * ```
 */
export class NASPDecoder {
	private readonly raw: Uint8Array;
	private current: number = 0;

	/**
	 * Creates a new instance of the {@link NASPDecoder} class.
	 *
	 * @param raw The raw binary data to decode.
	 */
	constructor(raw: Uint8Array) {
		this.raw = raw;
	}

	/**
	 * Attempt to decode a NASP message from the input buffer.
	 *
	 * The message may be a {@link NASPRequest} or {@link NASPResponse}.
	 *
	 * @returns A {@link Result} containing either the decoded message or a {@link NASPDecodeError} if decoding fails.
	 */
	public decode(): Result<NASPRequest | NASPResponse, NASPDecodeError> {
		const message_kind = this.readUntilCRLF();
		this.advanceOverCRLF();

		if (
			message_kind.toLowerCase() !== 'req' &&
			message_kind.toLowerCase() !== 'res'
		) {
			return Result.err(
				NASPDecodeError.message_kind_unrecognized(message_kind),
			);
		}

		const id = this.readLength();

		const payload = this.readUntilCRLF();
		this.advanceOverCRLF();

		switch (payload.toLowerCase()) {
			case 'command': {
				const command = this.decode_command();
				if (command.isErr()) {
					return Result.err(command.unwrapErr());
				}
				return Result.ok(
					new NASPRequest(
						id,
						new NASPPayload(NASPPayloadKind.COMMAND, payload),
						command.unwrap(),
					),
				);
			}
			case 'value': {
				const value = this.decode_object();
				if (value.isErr()) {
					return Result.err(value.unwrapErr());
				}
				return Result.ok(
					new NASPResponse(
						id,
						new NASPPayload(NASPPayloadKind.VALUE, payload),
						value.unwrap(),
					),
				);
			}
		}

		if (message_kind.toLowerCase() === 'req') {
			return Result.ok(
				new NASPRequest(
					id,
					new NASPPayload(NASPPayloadKind.CUSTOM, payload),
					undefined,
				),
			);
		}

		if (message_kind.toLowerCase() === 'res') {
			return Result.ok(
				new NASPResponse(
					id,
					new NASPPayload(NASPPayloadKind.CUSTOM, payload),
					undefined,
				),
			);
		}

		return Result.err(
			NASPDecodeError.message_kind_unrecognized(message_kind),
		);
	}

	/** @internal */
	private decode_command(): Result<NASPCommand, NASPDecodeError> {
		const object_result = this.decode_object();
		if (object_result.isErr()) {
			return Result.err(object_result.unwrapErr());
		}

		const object = object_result.unwrap();

		if (
			object.type !== NASPObjectType.ARRAY ||
			(object as NASPArray).data[0].type !== NASPObjectType.BULK_STRING
		) {
			return Result.err(
				NASPDecodeError.object_type_unrecognized(
					this.raw[this.current].toString(),
				),
			);
		}

		const command_name = ((object as NASPArray).data[0] as NASPBulkString)
			.data;

		const command_type_result = this.get_command_type(command_name);

		if (command_type_result.isErr()) {
			return Result.err(command_type_result.unwrapErr());
		}

		const [command_type, slice_at] = command_type_result.unwrap();

		return Result.ok(
			new NASPCommand(
				command_type,
				(object as NASPArray).data.slice(slice_at),
			),
		);
	}

	private get_command_type(
		command_name: string,
	): Result<[NASPCommandName, number], NASPDecodeError> {
		let command_type: NASPCommandName;
		const slice_at = 1;
		switch (command_name.toLowerCase()) {
			case 'ping': {
				command_type = NASPCommandName.PING;
				break;
			}
			case 'echo': {
				command_type = NASPCommandName.ECHO;
				break;
			}

			default: {
				return Result.err(
					NASPDecodeError.command_name_unrecognized(command_name),
				);
			}
		}
		return Result.ok([command_type, slice_at]);
	}

	/**
	 * Attempt to decode a NASP object from the input buffer.
	 *
	 * This method is not intended to be used directly. Use the `decode` method instead.
	 *
	 * @returns A {@link Result} containing either the decoded object or a {@link NASPDecodeError} if decoding fails.
	 */
	public decode_object(): Result<NASPObject, NASPDecodeError> {
		const firstChar = this.advance();

		switch (firstChar) {
			case SIMPLE_STRING_PREFIX:
				return this.decode_simple_string();
			case SIMPLE_ERROR_PREFIX:
				return this.decode_simple_error();
			case INTEGER_PREFIX:
				return this.decode_integer();
			case FLOAT_PREFIX:
				return this.decode_float();
			case BULK_STRING_PREFIX:
				return this.decode_bulk_string();
			case BULK_ERROR_PREFIX:
				return this.decode_bulk_error();
			case ARRAY_PREFIX:
				return this.decode_array();
			case TAGGED_STRING_PREFIX:
				return this.decode_tagged_string();
			default:
				return Result.err(
					NASPDecodeError.object_type_unrecognized(firstChar),
				);
		}
	}

	/** @internal */
	private decode_array(): Result<NASPArray, NASPDecodeError> {
		const length = this.readLength();
		const elements = [];

		for (let i = 0; i < length; i++) {
			const element = this.decode_object();
			if (element.isErr()) {
				return Result.err(element.unwrapErr());
			}
			elements.push(element.unwrap());
		}

		return Result.ok(new NASPArray(elements));
	}

	/** @internal */
	private decode_tagged_string(): Result<NASPTaggedString, NASPDecodeError> {
		const length = this.readLength();
		const encoding = this.readUntilTarget(
			TAGGED_STRING_ENCODING_VALUE_SEPERATOR,
		);

		this.advance();

		if (encoding.length !== TAGGED_STRING_ENCODING_LENGTH) {
			return Result.err(
				NASPDecodeError.tagged_string_encoding_length_mismatch(
					encoding.length,
				),
			);
		}

		const value = this.advance(
			length -
				encoding.length -
				TAGGED_STRING_ENCODING_VALUE_SEPERATOR.length,
		);

		if (!this.isCRLF()) {
			return Result.err(NASPDecodeError.missing_CRLF());
		}

		this.advanceOverCRLF();

		return Result.ok(NASPTaggedString.from(encoding, value));
	}

	/** @internal */
	private decode_bulk_string(): Result<NASPBulkString, NASPDecodeError> {
		const length = this.readLength();
		const value = this.advance(length);

		if (!this.isCRLF()) {
			return Result.err(NASPDecodeError.missing_CRLF());
		}

		this.advanceOverCRLF();

		return Result.ok(NASPBulkString.from(value));
	}

	/** @internal */
	private decode_bulk_error(): Result<NASPBulkError, NASPDecodeError> {
		const length = this.readLength();
		const value = this.advance(length);

		if (!this.isCRLF()) {
			return Result.err(NASPDecodeError.missing_CRLF());
		}

		this.advanceOverCRLF();

		return Result.ok(NASPBulkError.from(value));
	}

	/** @internal */
	private decode_float(): Result<NASPFloat, NASPDecodeError> {
		const value = this.readUntilCRLF();
		this.advanceOverCRLF();
		return Result.ok(NASPFloat.from(value));
	}

	/** @internal */
	private decode_integer(): Result<NASPInteger, NASPDecodeError> {
		const value = this.readUntilCRLF();
		this.advanceOverCRLF();
		return Result.ok(NASPInteger.from(value));
	}

	/** @internal */
	private decode_simple_string(): Result<NASPSimpleString, NASPDecodeError> {
		const value = this.readUntilCRLF();
		this.advanceOverCRLF();

		if (value.includes('\r') || value.includes('\n')) {
			return Result.err(
				NASPDecodeError.simple_string_contains_CR_or_LF(),
			);
		}

		return Result.ok(NASPSimpleString.from(value));
	}

	/** @internal */
	private decode_simple_error(): Result<NASPSimpleError, NASPDecodeError> {
		const value = this.readUntilCRLF();
		this.advanceOverCRLF();

		if (value.includes('\r') || value.includes('\n')) {
			return Result.err(NASPDecodeError.simple_error_contains_CR_or_LF());
		}

		return Result.ok(NASPSimpleError.from(value));
	}

	/** @internal */
	private readUntilTarget(target: string): string {
		let result = '';
		while (
			this.current < this.raw.length &&
			!bytesEqual(
				this.range(target.length),
				new TextEncoder().encode(target),
			)
		) {
			result += this.advance();
		}

		return result;
	}

	/** @internal */
	private readLength(): number {
		const result = this.readUntilCRLF();
		this.advanceOverCRLF();
		return parseInt(result);
	}

	/** @internal */
	private readUntilCRLF(): string {
		let result = '';
		while (
			this.current < this.raw.length &&
			!bytesEqual(this.range(2), CRLF_BYTES)
		) {
			result += this.advance();
		}

		return result;
	}

	/** @internal */
	private isCRLF(): boolean {
		return bytesEqual(this.range(2), CRLF_BYTES);
	}

	/** @internal */
	private range(to: number = 1): Uint8Array {
		to += this.current;
		return this.raw.subarray(this.current, to);
	}

	/** @internal */
	private advance(amount: number = 1): string {
		let result = '';
		for (let i = 0; i < amount; i++) {
			const char = this.raw[this.current];
			this.current++;
			result += String.fromCharCode(char);
		}
		return result;
	}

	/** @internal */
	private advanceOverCRLF(): void {
		this.advance();
		this.advance();
	}
}
