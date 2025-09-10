import { assertEquals } from '@std/assert';
import { NASPEncoder } from '../encode/encoder.ts';
import { NASPSimpleString } from '../objects/simpleString.ts';
import { NASPSimpleError } from '../objects/simpleError.ts';
import { NASPInteger } from '../objects/integer.ts';
import { NASPFloat } from '../objects/float.ts';
import { NASPBulkString } from '../objects/bulkString.ts';
import { NASPBulkError } from '../objects/bulkError.ts';
import {
	ARRAY_PREFIX,
	BULK_ERROR_PREFIX,
	BULK_STRING_PREFIX,
	CRLF,
	FLOAT_PREFIX,
	INTEGER_PREFIX,
	SIMPLE_ERROR_PREFIX,
	SIMPLE_STRING_PREFIX,
	TAGGED_STRING_ENCODING_VALUE_SEPERATOR,
	TAGGED_STRING_PREFIX,
} from '../constants.ts';
import { NASPTaggedString } from '../objects/taggedString.ts';
import { NASPArray } from '../objects/array.ts';
import { NASPPayload, NASPRequest, NASPResponse } from '../objects/messages.ts';
import { NASPPayloadKind } from '../objects/types.ts';

Deno.test('encode', async (t) => {
	await t.step('simple string', async (t) => {
		await t.step('can be encoded from a string', () => {
			const string = 'OK';
			const expected = new TextEncoder().encode(
				`${SIMPLE_STRING_PREFIX}${string}${CRLF}`,
			);
			const encoded = NASPEncoder.simple.simple_string(string);
			assertEquals(encoded, expected);
		});

		await t.step('can be encoded from an object', () => {
			const string = 'OK';
			const simple = NASPSimpleString.from(string);
			const expected = new TextEncoder().encode(
				`${SIMPLE_STRING_PREFIX}${string}${CRLF}`,
			);
			const encoded = NASPEncoder.simple.simple_string(simple);
			assertEquals(encoded, expected);
		});
	});

	await t.step('simple error', async (t) => {
		await t.step('can be encoded from a string', () => {
			const string = 'ERR';
			const expected = new TextEncoder().encode(
				`${SIMPLE_ERROR_PREFIX}${string}${CRLF}`,
			);
			const encoded = NASPEncoder.simple.simple_error(string);
			assertEquals(encoded, expected);
		});

		await t.step('can be encoded from an object', () => {
			const string = 'ERR';
			const simple = NASPSimpleError.from(string);
			const expected = new TextEncoder().encode(
				`${SIMPLE_ERROR_PREFIX}${string}${CRLF}`,
			);
			const encoded = NASPEncoder.simple.simple_error(simple);
			assertEquals(encoded, expected);
		});
	});

	await t.step('integer', async (t) => {
		await t.step('can be encoded from a number', () => {
			const integer = 10;
			const expected = new TextEncoder().encode(
				`${INTEGER_PREFIX}${integer}${CRLF}`,
			);
			const encoded = NASPEncoder.simple.integer(integer);
			assertEquals(encoded, expected);
		});

		await t.step('can be encoded from a string representation', () => {
			const representation = '10';
			const expected = new TextEncoder().encode(
				`${INTEGER_PREFIX}${representation}${CRLF}`,
			);
			const encoded = NASPEncoder.simple.integer(representation);
			assertEquals(encoded, expected);
		});

		await t.step('can be encoded from an object', () => {
			const int = 10;
			const integer = NASPInteger.from(int);
			const expected = new TextEncoder().encode(
				`${INTEGER_PREFIX}${int}${CRLF}`,
			);
			const encoded = NASPEncoder.simple.integer(integer);
			assertEquals(encoded, expected);
		});
	});

	await t.step('float', async (t) => {
		await t.step('can be encoded from a number', () => {
			const float = 3.14;
			const expected = new TextEncoder().encode(
				`${FLOAT_PREFIX}${float}${CRLF}`,
			);
			const encoded = NASPEncoder.simple.float(float);
			assertEquals(encoded, expected);
		});

		await t.step('can be encoded from a string representation', () => {
			const representation = '3.14';
			const expected = new TextEncoder().encode(
				`${FLOAT_PREFIX}${representation}${CRLF}`,
			);
			const encoded = NASPEncoder.simple.float(representation);
			assertEquals(encoded, expected);
		});

		await t.step('can be encoded from an object', () => {
			const double = 3.14;
			const float = NASPFloat.from(double);
			const expected = new TextEncoder().encode(
				`${FLOAT_PREFIX}${double}${CRLF}`,
			);
			const encoded = NASPEncoder.simple.float(float);
			assertEquals(encoded, expected);
		});
	});

	await t.step('bulk string', async (t) => {
		await t.step('can be encoded from a string', () => {
			const string = 'apple';
			const expected = new TextEncoder().encode(
				`${BULK_STRING_PREFIX}${string.length}${CRLF}${string}${CRLF}`,
			);
			const encoded = NASPEncoder.aggregate.bulk_string(string);
			assertEquals(encoded, expected);
		});

		await t.step('can be encoded from an object', () => {
			const string = 'apple';
			const bulk = NASPBulkString.from(string);
			const expected = new TextEncoder().encode(
				`${BULK_STRING_PREFIX}${string.length}${CRLF}${string}${CRLF}`,
			);
			const encoded = NASPEncoder.aggregate.bulk_string(bulk);
			assertEquals(encoded, expected);
		});
	});

	await t.step('bulk error', async (t) => {
		await t.step('can be encoded from a string', () => {
			const string = 'ERR unknown command';
			const expected = new TextEncoder().encode(
				`${BULK_ERROR_PREFIX}${string.length}${CRLF}${string}${CRLF}`,
			);
			const encoded = NASPEncoder.aggregate.bulk_error(string);
			assertEquals(encoded, expected);
		});

		await t.step('can be encoded from an object', () => {
			const string = 'ERR unknown command';
			const bulk = NASPBulkError.from(string);
			const expected = new TextEncoder().encode(
				`${BULK_ERROR_PREFIX}${string.length}${CRLF}${string}${CRLF}`,
			);
			const encoded = NASPEncoder.aggregate.bulk_error(bulk);
			assertEquals(encoded, expected);
		});
	});

	await t.step('tagged string', async (t) => {
		await t.step('can be encoded from a string', () => {
			const encoding = 'hex';
			const value = 'ffffff';
			const expected = new TextEncoder().encode(
				`${TAGGED_STRING_PREFIX}${encoding.length + value.length + TAGGED_STRING_ENCODING_VALUE_SEPERATOR.length}${CRLF}${encoding}${TAGGED_STRING_ENCODING_VALUE_SEPERATOR}${value}${CRLF}`,
			);
			const encoded = NASPEncoder.aggregate.tagged_string({
				encoding,
				data: value,
			});
			assertEquals(encoded, expected);
		});

		await t.step('can be encoded from an object', () => {
			const encoding = 'hex';
			const value = 'ffffff';
			const tagged_string = NASPTaggedString.from(encoding, value);
			const expected = new TextEncoder().encode(
				`${TAGGED_STRING_PREFIX}${encoding.length + value.length + TAGGED_STRING_ENCODING_VALUE_SEPERATOR.length}${CRLF}${encoding}${TAGGED_STRING_ENCODING_VALUE_SEPERATOR}${value}${CRLF}`,
			);
			const encoded = NASPEncoder.aggregate.tagged_string(tagged_string);
			assertEquals(encoded, expected);
		});
	});

	await t.step('array', async (t) => {
		await t.step('can be encoded', () => {
			const strings = ['OK', 'PONG'];
			const array = NASPArray.from_simple_str(...strings);
			const expected = new TextEncoder().encode(
				`${ARRAY_PREFIX}${strings.length}${CRLF}${strings.map((s) => `${SIMPLE_STRING_PREFIX}${s}${CRLF}`).join('')}`,
			);
			const encoded = NASPEncoder.aggregate.array(array);
			assertEquals(
				encoded,
				expected,
				`Received ${encoded}, expected ${expected}`,
			);
		});
	});

	await t.step('request', async (t) => {
		await t.step('can be encoded without a body', () => {
			const string = 'PING';
			const id = 1;
			const expected = new TextEncoder().encode(
				`REQ${CRLF}${id}${CRLF}${string}${CRLF}`,
			);
			const request = new NASPRequest(
				id,
				new NASPPayload(NASPPayloadKind.CUSTOM, string),
			);
			const encoded = NASPEncoder.message.request(request);
			assertEquals(encoded, expected);
		});

		await t.step('can be encoded with a body', () => {
			const string = 'PING';
			const id = 2;
			const expected = new TextEncoder().encode(
				`REQ${CRLF}${id}${CRLF}COMMAND${CRLF}${ARRAY_PREFIX}1${CRLF}${BULK_STRING_PREFIX}${string.length}${CRLF}${string}${CRLF}`,
			);
			const request = new NASPRequest(
				id,
				new NASPPayload(NASPPayloadKind.COMMAND),
				NASPArray.from_bulk_str(string),
			);
			const encoded = NASPEncoder.message.request(request);
			assertEquals(encoded, expected);
		});
	});

	await t.step('response', async (t) => {
		await t.step('can be encoded without a body', () => {
			const string = 'PONG';
			const id = 1;
			const expected = new TextEncoder().encode(
				`RES${CRLF}${id}${CRLF}${string}${CRLF}`,
			);
			const response = new NASPResponse(
				id,
				new NASPPayload(NASPPayloadKind.CUSTOM, string),
			);
			const encoded = NASPEncoder.message.response(response);
			assertEquals(encoded, expected);
		});

		await t.step('can be encoded with a body', () => {
			const string = 'PONG';
			const id = 2;
			const expected = new TextEncoder().encode(
				`RES${CRLF}${id}${CRLF}VALUE${CRLF}${SIMPLE_STRING_PREFIX}${string}${CRLF}`,
			);
			const response = new NASPResponse(
				id,
				new NASPPayload(NASPPayloadKind.VALUE),
				NASPSimpleString.from(string),
			);
			const encoded = NASPEncoder.message.response(response);
			assertEquals(encoded, expected);
		});
	});
});
