import { NASPAggregateEncoder } from './aggregate.ts';
import { NASPMessageEncoder } from './message.ts';
import { NASPSimpleEncoder } from './simple.ts';

/**
 * Encodes NASP objects or basic data types into raw binary data.
 *
 * This class only provides static methods for encoding simple objects, aggregate/complex objects, and messages.
 *
 * Example usage:
 * ```typescript
 * const encoded = NASPEncoder.simple.simple_string("OK");
 * assetEquals(encoded, new TextEncoder().encode("+OK\r\n"));
 * ```
 */
export class NASPEncoder {
	/**
	 * A static property that provides access to the NASPSimpleEncoder class which can be used to encode simple NASP objects.
	 */
	public static get simple(): typeof NASPSimpleEncoder {
		return NASPSimpleEncoder;
	}

	/**
	 * A static property that provides access to the NASPAggregateEncoder class which can be used to encode aggregate/complex NASP objects.
	 */
	public static get aggregate(): typeof NASPAggregateEncoder {
		return NASPAggregateEncoder;
	}

	/**
	 * A static property that provides access to the NASPMessageEncoder class which can be used to encode NASP messages.
	 */
	public static get message(): typeof NASPMessageEncoder {
		return NASPMessageEncoder;
	}
}
