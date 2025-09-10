import {
	ARRAY_LENGTH_MAX,
	BULK_SIZE_MAX,
	SIMPLE_SIZE_MAX,
	TAGGED_STRING_SIZE_MAX,
} from '../constants.ts';
import { NASPBulkError } from '../objects/bulkError.ts';
import { NASPBulkString } from '../objects/bulkString.ts';
import { NASPFloat } from '../objects/float.ts';
import { NASPInteger } from '../objects/integer.ts';
import { NASPSimpleError } from '../objects/simpleError.ts';
import { NASPSimpleString } from '../objects/simpleString.ts';
import { NASPTaggedString } from '../objects/taggedString.ts';
import { NASPArray } from '../objects/array.ts';
import { assertEquals, assertThrows } from '@std/assert';
import { NASPPayload, NASPRequest, NASPResponse } from '../objects/messages.ts';
import { assert } from '@std/assert/assert';
import { NASPPayloadKind } from '../objects/types.ts';

Deno.test('objects', async (t) => {
	await t.step('simple string', async (t) => {
		await t.step('can be created', () => {
			const string = 'OK';
			const simple = NASPSimpleString.from(string);
			assertEquals(simple.data, string);
		});
		await t.step('can be created at byte boundary', () => {
			const string = 'a'.repeat(SIMPLE_SIZE_MAX);
			const simple = NASPSimpleString.from(string);
			assertEquals(simple.data, string);
		});
		await t.step('will error if created after byte boundary', () => {
			const string = 'a'.repeat(SIMPLE_SIZE_MAX + 1);
			assertThrows(() => NASPSimpleString.from(string));
		});
	});

	await t.step('simple error', async (t) => {
		await t.step('can be created', () => {
			const string = 'ERR';
			const simple = NASPSimpleError.from(string);
			assertEquals(simple.data, string);
		});
		await t.step('can be created at byte boundary', () => {
			const string = 'a'.repeat(SIMPLE_SIZE_MAX);
			const simple = NASPSimpleError.from(string);
			assertEquals(simple.data, string);
		});
		await t.step('will error if created after byte boundary', () => {
			const string = 'a'.repeat(SIMPLE_SIZE_MAX + 1);
			assertThrows(() => NASPSimpleError.from(string));
		});
	});

	await t.step('integer', async (t) => {
		await t.step('can be created', () => {
			const representation = '123';
			const integer = NASPInteger.from(representation);
			assertEquals(integer.data, parseInt(representation));
		});
		await t.step('can be created at byte boundary', () => {
			const representation = Number.MAX_SAFE_INTEGER.toString();
			const integer = NASPInteger.from(representation);
			assertEquals(integer.data, parseInt(representation));
		});
		await t.step('will error if created after byte boundary', () => {
			const representation = Number.MAX_SAFE_INTEGER.toString() + '1';
			assertThrows(() => NASPInteger.from(representation));
		});
	});

	await t.step('float', async (t) => {
		await t.step('can be created', () => {
			const representation = '3.14';
			const float = NASPFloat.from(representation);
			assertEquals(float.data, parseFloat(representation));
		});
		await t.step('can be created at byte boundary', () => {
			const representation = Number.MAX_VALUE.toString();
			const float = NASPFloat.from(representation);
			assertEquals(float.data, parseFloat(representation));
		});
		await t.step('will error if created after byte boundary', () => {
			const representation = Number.MAX_VALUE.toString() + '1';
			assertThrows(() => NASPFloat.from(representation));
		});
	});

	await t.step('bulk string', async (t) => {
		await t.step('can be created', () => {
			const string = 'bannana';
			const bulk = NASPBulkString.from(string);
			assertEquals(bulk.data, string);
		});
		await t.step('can be created at byte boundary', () => {
			const string = 'a'.repeat(BULK_SIZE_MAX);
			const bulk = NASPBulkString.from(string);
			assertEquals(bulk.data, string);
		});
		await t.step('will error if created after byte boundary', () => {
			const string = 'a'.repeat(BULK_SIZE_MAX + 1);
			assertThrows(() => NASPBulkString.from(string));
		});
	});

	await t.step('bulk error', async (t) => {
		await t.step('can be created', () => {
			const string = 'ERR unknown command';
			const bulk = NASPBulkError.from(string);
			assertEquals(bulk.data, string);
		});
		await t.step('can be created at byte boundary', () => {
			const string = 'a'.repeat(BULK_SIZE_MAX);
			const bulk = NASPBulkError.from(string);
			assertEquals(bulk.data, string);
		});
		await t.step('will error if created after byte boundary', () => {
			const string = 'a'.repeat(BULK_SIZE_MAX + 1);
			assertThrows(() => NASPBulkError.from(string));
		});
	});

	await t.step('tagged string', async (t) => {
		await t.step('can be created', () => {
			const encoding = 'hex';
			const hex = 'ffffff';
			const bulk = NASPTaggedString.from(encoding, hex);
			assertEquals(bulk.data, hex);
		});
		await t.step('can be created at byte boundary', () => {
			const encoding = 'hex';
			const hex = 'f'.repeat(TAGGED_STRING_SIZE_MAX - 4);
			const bulk = NASPTaggedString.from(encoding, hex);
			assertEquals(bulk.data, hex);
		});
		await t.step('will error if created after byte boundary', () => {
			const encoding = 'hex';
			const hex = 'f'.repeat(TAGGED_STRING_SIZE_MAX - 3);
			assertThrows(() => NASPTaggedString.from(encoding, hex));
		});
	});

	await t.step('array', async (t) => {
		await t.step('can be created', () => {
			const values = ['apple', 'banana', 'cherry'];
			const array = NASPArray.from_bulk_str(...values);
			assertEquals(
				array.data,
				values.map((v) => NASPBulkString.from(v)),
			);
		});
		await t.step('can be created at length boundary', () => {
			const values: string[] = [];
			for (let i = 0; i < ARRAY_LENGTH_MAX; i++) {
				values.push(`value${i}`);
			}
			const array = NASPArray.from_bulk_str(...values);
			assertEquals(
				array.data,
				values.map((v) => NASPBulkString.from(v)),
			);
		});
		await t.step('will error if created after length boundary', () => {
			const values: string[] = [];
			for (let i = 0; i < ARRAY_LENGTH_MAX + 1; i++) {
				values.push(`value${i}`);
			}
			assertThrows(() => NASPArray.from_bulk_str(...values));
		});
	});

	await t.step('request', async (t) => {
		await t.step('can be created without a body', () => {
			const string = 'PING';
			const id = 1;
			const request = new NASPRequest(
				id,
				new NASPPayload(NASPPayloadKind.CUSTOM, string),
			);
			assert(request instanceof NASPRequest);
		});

		await t.step('can be created with a body', () => {
			const string = 'PING';
			const id = 1;
			const request = new NASPRequest(
				id,
				new NASPPayload(NASPPayloadKind.COMMAND),
				NASPBulkString.from(string),
			);
			assert(request instanceof NASPRequest);
		});
	});

	await t.step('response', async (t) => {
		await t.step('can be created without a body', () => {
			const string = 'PONG';
			const id = 1;
			const response = new NASPResponse(
				id,
				new NASPPayload(NASPPayloadKind.CUSTOM, string),
			);
			assert(response instanceof NASPResponse);
		});

		await t.step('can be created with a body', () => {
			const string = 'PONG';
			const id = 1;
			const response = new NASPResponse(
				id,
				new NASPPayload(NASPPayloadKind.VALUE),
				NASPSimpleString.from(string),
			);
			assert(response instanceof NASPResponse);
		});
	});
});
