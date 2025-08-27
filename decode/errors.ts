/**
 * The error class for NASP decoding errors.
 *
 * @extends Error
 */
export class NASPDecodeError extends Error {
	/**
	 * Creates a new NASPDecodeError with a message that indicates a simple string contains CR or LF.
	 */
	public static simple_string_contains_CR_or_LF(): NASPDecodeError {
		return new NASPDecodeError('Simple string contains CR or LF');
	}

	/**
	 * Creates a new NASPDecodeError with a message that indicates a simple error contains CR or LF.
	 */
	public static simple_error_contains_CR_or_LF(): NASPDecodeError {
		return new NASPDecodeError('Simple error contains CR or LF');
	}

	/**
	 * Creates a new NASPDecodeError with a message that indicates a tagged string encoding length mismatch.
	 */
	public static tagged_string_encoding_length_mismatch(
		got: number,
	): NASPDecodeError {
		return new NASPDecodeError(
			`Tagged string encoding length mismatch: got ${got}, expected 3`,
		);
	}

	/**
	 * Creates a new NASPDecodeError with a message that indicates an object type is unrecognized.
	 */
	public static object_type_unrecognized(char: string): NASPDecodeError {
		return new NASPDecodeError(`Object type unrecognized: ${char}`);
	}

	/**
	 * Creates a new NASPDecodeError with a message that indicates a message kind is unrecognized.
	 */
	public static message_kind_unrecognized(char: string): NASPDecodeError {
		return new NASPDecodeError(`Message kind unrecognized: ${char}`);
	}

	/**
	 * Creates a new NASPDecodeError with a message that indicates a command name is unrecognized.
	 */
	public static command_name_unrecognized(char: string): NASPDecodeError {
		return new NASPDecodeError(`Command name unrecognized: ${char}`);
	}

	/**
	 * Creates a new NASPDecodeError with a message that indicates a missing CRLF.
	 */
	public static missing_CRLF(): NASPDecodeError {
		return new NASPDecodeError('Missing CRLF');
	}

	/**
	 * Creates a new instance of the {@link NASPDecodeError} class.
	 */
	constructor(message: string) {
		super(message);
		this.name = 'NASPDecodeError';
	}
}
