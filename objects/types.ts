import type { NASPArray } from './array.ts';
import type { NASPBulkError } from './bulkError.ts';
import type { NASPBulkString } from './bulkString.ts';
import type { NASPCommand } from './command.ts';
import type { NASPFloat } from './float.ts';
import type { NASPInteger } from './integer.ts';
import type { NASPSimpleError } from './simpleError.ts';
import type { NASPSimpleString } from './simpleString.ts';
import type { NASPTaggedString } from './taggedString.ts';

/** The enum representing the kinds of all NASP payloads */
export enum NASPPayloadKind {
	/** The body of the request will contain a command */
	COMMAND,
	/** The body of the request will contain a value */
	VALUE,
	/** The payload will contain the command or response */
	CUSTOM,
}

/** The enum representing the kinds of all NASP messages */
export enum NASPMessageKind {
	/** The message is a request */
	REQUEST,
	/** The message is a response */
	RESPONSE,
}

/** The enum representing the types of all NASP objects (not messages) */
export enum NASPObjectType {
	/** The object is a simple string */
	SIMPLE_STRING,
	/** The object is a simple error */
	SIMPLE_ERROR,
	/** The object is a bulk string */
	BULK_STRING,
	/** The object is a bulk error */
	BULK_ERROR,
	/** The object is an integer */
	INTEGER,
	/** The object is a float */
	FLOAT,
	/** The object is a tagged string */
	TAGGED_STRING,
	/** The object is an array */
	ARRAY,
	/** The object is a command */
	COMMAND,
}

/** The enum representing the names of all NASP commands */
export enum NASPCommandName {
	/** The command is a ping command */
	PING,
	/** The command is an echo command */
	ECHO,
}

/** The type representing any and all NASP objects (not messages) */
export type NASPObject =
	| NASPSimpleString
	| NASPSimpleError
	| NASPBulkString
	| NASPBulkError
	| NASPInteger
	| NASPFloat
	| NASPTaggedString
	| NASPArray
	| NASPCommand;
