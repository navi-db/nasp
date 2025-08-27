/**
 * Error class for when NASPObject instances are invalid when created.
 */
export class NASPObjectError extends Error {
	/**
	 * Creates a new NASPObjectError instance.
	 *
	 * @param message - The error message.
	 */
	constructor(message: string) {
		super(message);
		this.name = 'NASPObjectError';
	}
}
