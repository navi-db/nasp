import { NASPMessageKind, NASPPayloadKind, type NASPObject } from './types.ts';

/**
 * Abstract base class for all NASP messages.
 * Not intended to be instantiated directly.
 */
export abstract class NASPMessage {
	/** The kind of message (REQUEST or RESPONSE) */
	abstract kind: NASPMessageKind;

	/** Unique identifier for the message */
	public id: number;

	/** Payload associated with the message */
	public payload: NASPPayload;

	/** Optional body of the message, can be any NASPObject */
	public body?: NASPObject;

	/**
	 * Creates a new NASPMessage.
	 * @param id - Unique message identifier
	 * @param payload - Payload of the message
	 * @param body - Optional message body
	 */
	constructor(id: number, payload: NASPPayload, body?: NASPObject) {
		this.id = id;
		this.payload = payload;
		this.body = body;
	}
}

/**
 * A NASP request message.
 */
export class NASPRequest extends NASPMessage {
	/** The kind of message */
	public kind: NASPMessageKind = NASPMessageKind.REQUEST;
}

/**
 * A NASP response message.
 */
export class NASPResponse extends NASPMessage {
	/** The kind of message */
	public kind: NASPMessageKind = NASPMessageKind.RESPONSE;
}

/**
 * Represents the payload of a NASP message.
 */
export class NASPPayload {
	/** The kind of payload */
	public kind: NASPPayloadKind;

	/** The data contained in the payload */
	public data: string;

	/**
	 * Creates a new NASPPayload.
	 * @param kind - The kind of payload
	 * @param data - Optional data (required for CUSTOM payloads)
	 * @throws Will throw an error if kind is CUSTOM and no data is provided
	 */
	constructor(kind: NASPPayloadKind, data?: string) {
		this.kind = kind;

		if (kind === NASPPayloadKind.CUSTOM && data === undefined) {
			throw new Error('Custom payload requires data');
		}

		switch (kind) {
			case NASPPayloadKind.COMMAND:
				this.data = 'COMMAND';
				break;
			case NASPPayloadKind.VALUE:
				this.data = 'VALUE';
				break;
			case NASPPayloadKind.CUSTOM:
				this.data = data!;
				break;
		}
	}
}
