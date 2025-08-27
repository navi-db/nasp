import type { NASPObject, NASPObjectType } from './types.ts';

/**
 * Base class for all NASP objects.
 */
export abstract class NASPBaseObject {
	/** Type of the object. */
	abstract type: NASPObjectType;

	/** Raw representation of the object data. */
	abstract get raw(): Uint8Array;

	/** Raw representation of the object. */
	abstract get objectRaw(): Uint8Array;

	/** Size of the object in bytes. */
	abstract get size(): number;

	/** Data of the object. */
	abstract get data(): string | number | NASPObject[];
}
