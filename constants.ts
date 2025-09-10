/** The maximum size a simple string or simple error can be. This limit is **512 bytes**. */
export const SIMPLE_SIZE_MAX = 512;

/** The maximum size a bulk string or bulk error can be. This limit is **2MB**. */
export const BULK_SIZE_MAX = 2 * 1024 * 1024;

/** The maximum size a tagged string can be. This limit is **128KB**. */
export const TAGGED_STRING_SIZE_MAX = 128 * 1024;

/** The maximum size a request or response can be. This limit is **64MB**. */
export const MESSAGE_SIZE_MAX = 64 * 1024 * 1024;

/** The maximum size an array can be. This limit is **64MB**. */
export const ARRAY_SIZE_MAX = 64 * 1024 * 1024;

/** The maximum length an array can be. This limit is **512 items**. */
export const ARRAY_LENGTH_MAX = 512;

/** The terminator used in the Navi Serialisation Protocol */
export const CRLF = '\r\n';

/** The terminator in raw bytes used in the Navi Serialisation Protocol */
export const CRLF_BYTES: Uint8Array<ArrayBufferLike> = new TextEncoder().encode(
	CRLF,
);

/** The first byte of an encoded simple string */
export const SIMPLE_STRING_PREFIX = '+';

/** The first byte of an encoded simple error */
export const SIMPLE_ERROR_PREFIX = '-';

/** The first byte of an encoded integer */
export const INTEGER_PREFIX = ':';

/** The first byte of an encoded float */
export const FLOAT_PREFIX = ';';

/** The first byte of an encoded bulk string */
export const BULK_STRING_PREFIX = '$';

/** The first byte of an encoded bulk error */
export const BULK_ERROR_PREFIX = '!';

/** The first byte of an encoded tagged string */
export const TAGGED_STRING_PREFIX = '=';

/** The first byte of an encoded array */
export const ARRAY_PREFIX = '*';

/** The separator character used to separate a tagged string's encoding and encoded value */
export const TAGGED_STRING_ENCODING_VALUE_SEPERATOR = ':';

/** The length of a tagged string's encoding */
export const TAGGED_STRING_ENCODING_LENGTH = 3;
