import { assert, assertEquals } from '@std/assert';
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
import { NASPDecoder } from '../decode/class.ts';
import {
	NASPCommandName,
	NASPMessageKind,
	NASPObjectType,
	NASPPayloadKind,
} from '../objects/types.ts';
import type { NASPTaggedString } from '../objects/taggedString.ts';
import { NASPArray } from '../objects/array.ts';
import { NASPPayload } from '../objects/messages.ts';
import { NASPCommand } from '../objects/command.ts';
import { NASPSimpleString } from '../objects/simpleString.ts';

Deno.test('decode', async (t) => {
	await t.step('simple string', async (t) => {
		await t.step('can be decoded', () => {
			const string = 'OK';
			const encoded = new TextEncoder().encode(
				`${SIMPLE_STRING_PREFIX}${string}${CRLF}`,
			);
			const simple = new NASPDecoder(encoded).decode_object();
			assert(simple.isOk());
			assertEquals(simple.unwrap().type, NASPObjectType.SIMPLE_STRING);
			assertEquals(simple.unwrap().data, string);
		});

		await t.step('will not allow a CR character', () => {
			const string = 'OK\r';
			const encoded = new TextEncoder().encode(
				`${SIMPLE_STRING_PREFIX}${string}${CRLF}`,
			);
			const simple = new NASPDecoder(encoded).decode_object();
			assert(simple.isErr());
		});

		await t.step('will not allow a LF character', () => {
			const string = 'OK\n';
			const encoded = new TextEncoder().encode(
				`${SIMPLE_STRING_PREFIX}${string}${CRLF}`,
			);
			const simple = new NASPDecoder(encoded).decode_object();
			assert(simple.isErr());
		});
	});

	await t.step('simple error', async (t) => {
		await t.step('can be decoded', () => {
			const error = `ERR`;
			const encoded = new TextEncoder().encode(
				`${SIMPLE_ERROR_PREFIX}${error}${CRLF}`,
			);
			const simple = new NASPDecoder(encoded).decode_object();
			assert(simple.isOk());
			assertEquals(simple.unwrap().type, NASPObjectType.SIMPLE_ERROR);
			assertEquals(simple.unwrap().data, error);
		});

		await t.step('will not allow a CR character', () => {
			const error = 'ERR\r';
			const encoded = new TextEncoder().encode(
				`${SIMPLE_ERROR_PREFIX}${error}${CRLF}`,
			);
			const simple = new NASPDecoder(encoded).decode_object();
			assert(simple.isErr());
		});

		await t.step('will not allow a LF character', () => {
			const error = 'ERR\n';
			const encoded = new TextEncoder().encode(
				`${SIMPLE_ERROR_PREFIX}${error}${CRLF}`,
			);
			const simple = new NASPDecoder(encoded).decode_object();
			assert(simple.isErr());
		});
	});

	await t.step('integer', async (t) => {
		await t.step('can be decoded', () => {
			const int = 123;
			const encoded = new TextEncoder().encode(
				`${INTEGER_PREFIX}${int}${CRLF}`,
			);
			const integer = new NASPDecoder(encoded).decode_object();
			assert(integer.isOk());
			assertEquals(integer.unwrap().type, NASPObjectType.INTEGER);
			assertEquals(integer.unwrap().data, int);
		});

		await t.step('can retain a representation', () => {
			const int = '+123';
			const encoded = new TextEncoder().encode(
				`${INTEGER_PREFIX}${int}${CRLF}`,
			);
			const integer = new NASPDecoder(encoded).decode_object();
			assert(integer.isOk());
			assertEquals(integer.unwrap().type, NASPObjectType.INTEGER);
			assertEquals(new TextDecoder().decode(integer.unwrap().raw), int);
		});
	});

	await t.step('float', async (t) => {
		await t.step('can be decoded', () => {
			const double = 3.14e10;
			const encoded = new TextEncoder().encode(
				`${FLOAT_PREFIX}${double}${CRLF}`,
			);
			const float = new NASPDecoder(encoded).decode_object();
			assert(float.isOk());
			assertEquals(float.unwrap().type, NASPObjectType.FLOAT);
			assertEquals(float.unwrap().data, double);
		});

		await t.step('can retain a representation', () => {
			const double = '3.14e10';
			const encoded = new TextEncoder().encode(
				`${FLOAT_PREFIX}${double}${CRLF}`,
			);
			const float = new NASPDecoder(encoded).decode_object();
			assert(float.isOk());
			assertEquals(float.unwrap().type, NASPObjectType.FLOAT);
			assertEquals(new TextDecoder().decode(float.unwrap().raw), double);
		});
	});

	await t.step('bulk string', async (t) => {
		await t.step('can be decoded', () => {
			const string = 'apple';
			const encoded = new TextEncoder().encode(
				`${BULK_STRING_PREFIX}${string.length}${CRLF}${string}${CRLF}`,
			);
			const bulk = new NASPDecoder(encoded).decode_object();
			assert(bulk.isOk());
			assertEquals(bulk.unwrap().type, NASPObjectType.BULK_STRING);
			assertEquals(bulk.unwrap().data, string);
		});

		await t.step('can be decoded with CRLF characters', () => {
			const string = 'a\r\np\rp\n\nl\r\re\n';
			const encoded = new TextEncoder().encode(
				`${BULK_STRING_PREFIX}${string.length}${CRLF}${string}${CRLF}`,
			);
			const bulk = new NASPDecoder(encoded).decode_object();
			assert(bulk.isOk());
			assertEquals(bulk.unwrap().type, NASPObjectType.BULK_STRING);
			assertEquals(bulk.unwrap().data, string);
		});
	});

	await t.step('bulk error', async (t) => {
		await t.step('can be decoded', () => {
			const error = 'ERR unknown command';
			const encoded = new TextEncoder().encode(
				`${BULK_ERROR_PREFIX}${error.length}${CRLF}${error}${CRLF}`,
			);
			const bulk = new NASPDecoder(encoded).decode_object();
			assert(bulk.isOk());
			assertEquals(bulk.unwrap().type, NASPObjectType.BULK_ERROR);
			assertEquals(bulk.unwrap().data, error);
		});

		await t.step('can be decoded with CRLF characters', () => {
			const error = 'ERR\r\nunknown\n\ncommand\r\r';
			const encoded = new TextEncoder().encode(
				`${BULK_ERROR_PREFIX}${error.length}${CRLF}${error}${CRLF}`,
			);
			const bulk = new NASPDecoder(encoded).decode_object();
			assert(bulk.isOk());
			assertEquals(bulk.unwrap().type, NASPObjectType.BULK_ERROR);
			assertEquals(bulk.unwrap().data, error);
		});
	});

	await t.step('tagged string', async (t) => {
		await t.step('can be encoded', () => {
			const encoding = 'hex';
			const value = 'ffffff';
			const encoded = new TextEncoder().encode(
				`${TAGGED_STRING_PREFIX}${encoding.length + value.length + TAGGED_STRING_ENCODING_VALUE_SEPERATOR.length}${CRLF}${encoding}${TAGGED_STRING_ENCODING_VALUE_SEPERATOR}${value}${CRLF}`,
			);
			const tagged_string = new NASPDecoder(encoded).decode_object();
			assert(tagged_string.isOk());
			assertEquals(
				tagged_string.unwrap().type,
				NASPObjectType.TAGGED_STRING,
			);
			assertEquals(tagged_string.unwrap().data, value);
			assertEquals(
				(tagged_string.unwrap() as NASPTaggedString).encoding,
				encoding,
			);
		});
	});

	await t.step('array', async (t) => {
		await t.step('can be encoded', () => {
			const values = ['apple', 'bannana', 'orange'];
			const encoded = new TextEncoder().encode(
				`${ARRAY_PREFIX}${values.length}${CRLF}${values.map((v) => `${BULK_STRING_PREFIX}${v.length}${CRLF}${v}${CRLF}`).join('')}`,
			);
			const array = new NASPDecoder(encoded).decode_object();
			assert(array.isOk());
			assertEquals(array.unwrap().type, NASPObjectType.ARRAY);
			assertEquals(
				array.unwrap().data,
				NASPArray.from_bulk_str(...values).data,
			);
		});
	});

	await t.step('request', async (t) => {
		await t.step('can be encoded without a body', () => {
			const payload = 'PING';
			const id = 1;
			const encoded = new TextEncoder().encode(
				`REQ${CRLF}${id}${CRLF}${payload}${CRLF}`,
			);
			const request = new NASPDecoder(encoded).decode();
			assert(request.isOk());
			assertEquals(request.unwrap().kind, NASPMessageKind.REQUEST);
			assertEquals(request.unwrap().id, id);
			assertEquals(
				request.unwrap().payload,
				new NASPPayload(NASPPayloadKind.CUSTOM, payload),
			);
			assertEquals(request.unwrap().body, undefined);
		});

		await t.step('can be encoded with a body', () => {
			const body = `${ARRAY_PREFIX}1${CRLF}${BULK_STRING_PREFIX}4${CRLF}PING${CRLF}`;
			const id = 2;
			const encoded = new TextEncoder().encode(
				`REQ${CRLF}${id}${CRLF}COMMAND${CRLF}${body}`,
			);
			const request = new NASPDecoder(encoded).decode();
			assert(request.isOk());
			assertEquals(request.unwrap().kind, NASPMessageKind.REQUEST);
			assertEquals(request.unwrap().id, id);
			assertEquals(
				request.unwrap().payload,
				new NASPPayload(NASPPayloadKind.COMMAND),
			);
			assertEquals(
				request.unwrap().body,
				NASPCommand.from_bulk_str(NASPCommandName.PING),
			);
		});
	});

	await t.step('response', async (t) => {
		await t.step('can be encoded without a body', () => {
			const payload = 'PONG';
			const id = 1;
			const encoded = new TextEncoder().encode(
				`RES${CRLF}${id}${CRLF}${payload}${CRLF}`,
			);
			const response = new NASPDecoder(encoded).decode();
			assert(response.isOk());
			assertEquals(response.unwrap().kind, NASPMessageKind.RESPONSE);
			assertEquals(response.unwrap().id, id);
			assertEquals(
				response.unwrap().payload,
				new NASPPayload(NASPPayloadKind.CUSTOM, payload),
			);
			assertEquals(response.unwrap().body, undefined);
		});

		await t.step('can be encoded with a body', () => {
			const body = `${SIMPLE_STRING_PREFIX}PONG${CRLF}`;
			const id = 2;
			const encoded = new TextEncoder().encode(
				`RES${CRLF}${id}${CRLF}VALUE${CRLF}${body}`,
			);
			const response = new NASPDecoder(encoded).decode();
			assert(response.isOk());
			assertEquals(response.unwrap().kind, NASPMessageKind.RESPONSE);
			assertEquals(response.unwrap().id, id);
			assertEquals(
				response.unwrap().payload,
				new NASPPayload(NASPPayloadKind.VALUE),
			);
			assertEquals(response.unwrap().body, NASPSimpleString.from('PONG'));
		});
	});
});
