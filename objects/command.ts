import {
	ARRAY_LENGTH_MAX,
	ARRAY_PREFIX,
	ARRAY_SIZE_MAX,
	CRLF,
	CRLF_BYTES,
} from '../constants.ts';
import { countDigits } from '../utils.ts';
import { NASPBaseObject } from './base.ts';
import { NASPBulkString } from './bulkString.ts';
import { NASPObjectError } from './errors.ts';
import {
	type NASPCommandName,
	type NASPObject,
	NASPObjectType,
} from './types.ts';

/**
 * A NASP command object. This class is essentially a NASP array object but instead it has attributes that represent the command name and arguments.
 *
 * Example usage:
 * ```typescript
 * const command = NASPCommand.from_bulk_str(NASPCommandName.PING);
 * assertEquals(command.raw, new TextEncoder().encode('$4\r\nPING\r\n'))
 * assertEquals(command.objectRaw, new TextEncoder().encode('*1\r\n$4\r\nPING\r\n'))
 * assertEquals(command.data, [])
 * assertEquals(command.size, '*1\r\n$4\r\nPING\r\n'.length)
 * ```
 */
export class NASPCommand extends NASPBaseObject {
	/** The type of the object. This will always be `NASPObjectType.COMMAND`. */
	public type: NASPObjectType = NASPObjectType.COMMAND;

	/** The name of the command. */
	public name: NASPCommandName;
	private _raw: Uint8Array;
	private _args: NASPObject[];

	/** The raw representation of the command's arguments (including the command name) */
	public get raw(): Uint8Array {
		return this._raw;
	}

	/** Raw representation of the command. */
	public get objectRaw(): Uint8Array {
		return Uint8Array.from([
			new TextEncoder().encode(ARRAY_PREFIX),
			...new TextEncoder().encode(this._raw.length.toString()),
			...CRLF_BYTES,
			...this._raw,
		]);
	}

	/** The command's arguments as an array of NASPObject instances */
	public get data(): NASPObject[] {
		return this._args;
	}

	/** The size of the command in bytes */
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
	 * Create a new command of bulk strings from a list of strings
	 * @param name - The name of the command.
	 * @param data - The list of strings to create the command arguments from.
	 * @returns A new instance of NASPCommand.
	 */
	public static from_bulk_str(
		name: NASPCommandName,
		...data: string[]
	): NASPCommand {
		return new NASPCommand(
			name,
			data.map((bulk) => NASPBulkString.from(bulk)),
		);
	}

	/**
	 * Creates a new instance of NASPCommand from the command name and a list of NASPObject instances.
	 *
	 * @param name - The name of the command.
	 * @param args - The list of NASPObject instances to create the command arguments from.
	 * @throws {NASPObjectError} If the array size is too large, or if the array is too long.
	 */
	constructor(name: NASPCommandName, args: NASPObject[]) {
		const raw = Uint8Array.from(args.map((obj) => obj.objectRaw));
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
		if (args.length > ARRAY_LENGTH_MAX) {
			throw new NASPObjectError(
				`Array length is too large, maximum length is ${ARRAY_LENGTH_MAX}. Received ${args.length} items.`,
			);
		}
		super();
		this._args = args;
		this._raw = raw;
		this.name = name;
	}
}
