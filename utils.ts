/**
 * Counts the number of digits in an integer.
 *
 * @param {number} n - The integer to count the digits of.
 * @returns {number} The number of digits in the integer.
 * @throws {Error} If the input is not an integer, or if it is negative, an error is thrown.
 */
export function countDigits(n: number): number {
	if (!Number.isInteger(n)) {
		throw new Error('Input must be an integer');
	}

	if (n < 0) {
		throw new Error('Input must be non-negative');
	}

	if (n === 0) {
		return 1;
	}

	return Math.floor(Math.log10(n) + 1);
}
