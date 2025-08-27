# NASP

[![JSR Scope](https://jsr.io/badges/@navi)](https://jsr.io/@navi)
[![JSR](https://jsr.io/badges/@navi/nasp)](https://jsr.io/@navi/nasp)
[![JSR Score](https://jsr.io/badges/@navi/nasp/score)](https://jsr.io/@navi/nasp)

**NASP** (or Navi Serialisation Protocol) is a TypeScript library for creating, encoding, and decoding NASP messages and objects. It provides strongly typed classes and enums to handle NASP requests, responses, and payloads, making it easier to work with NASP messages in TypeScript projects.

---

## Features

- Strongly typed NASP message and payload classes.
- Support for `REQUEST` and `RESPONSE` messages.
- Built-in payload types: `COMMAND`, `VALUE`, and `CUSTOM`.
- Easy-to-extend base classes for NASP objects.
- Type-safe TypeScript implementation for better developer experience.

---

## Installation

```bash
# Using Deno
deno add @navi/nasp

# Using npm
npx jsr add @navi/nasp
```

## Usage Creating a Request

```typescript
import {
	NASPRequest,
	NASPPayload,
	NASPMessageKind,
	NASPPayloadKind,
} from '@navi/nasp';

// Create a payload
const payload = new NASPPayload(NASPPayloadKind.COMMAND);

// Create a request
const request = new NASPRequest(1, payload);

console.log(request.kind); // NASPMessageKind.REQUEST
console.log(request.payload.data); // "COMMAND"
```

## Creating a Response

```typescript
import {
	NASPResponse,
	NASPPayload,
	NASPMessageKind,
	NASPPayloadKind,
} from '@navi/nasp';

const payload = new NASPPayload(NASPPayloadKind.CUSTOM, '42');
const response = new NASPResponse(1, payload);

console.log(response.kind); // NASPMessageKind.RESPONSE
console.log(response.payload.data); // "42"
```

## API Reference

### Classes

#### NASPMessage (abstract)

Base class for all NASP messages.

**Properties:**

- `id` (number): Unique identifier for the message.
- `payload` (NASPPayload): The payload associated with the message.
- `body` (optional, NASPObject): Optional message body.
- `kind` (NASPMessageKind): Abstract property; must be defined in subclasses.

**Constructor:** Accepts `id`, `payload`, and optional `body`.

---

#### NASPRequest

Represents a NASP request message.

**Extends:** NASPMessage **Properties:**

- `kind` (NASPMessageKind): Always set to `REQUEST`.

---

#### NASPResponse

Represents a NASP response message.

**Extends:** NASPMessage **Properties:**

- `kind` (NASPMessageKind): Always set to `RESPONSE`.

---

#### NASPPayload

Represents the payload of a NASP message.

**Properties:**

- `kind` (NASPPayloadKind): Type of payload (`COMMAND`, `VALUE`, or `CUSTOM`).
- `data` (string): Data associated with the payload. For `COMMAND` and `VALUE`, defaults to their respective string names. For `CUSTOM`, must be provided.

**Constructor:** Accepts `kind` and optional `data` (required if `kind` is `CUSTOM`).

---

### Enums

#### NASPMessageKind

Enumeration for message types:

- `REQUEST`
- `RESPONSE`

#### NASPPayloadKind

Enumeration for payload types:

- `COMMAND`
- `VALUE`
- `CUSTOM`

## Contributing

Fork the repository Create your feature branch: git checkout -b feature/YourFeature Commit your changes: git commit -m 'Add feature' Push to the branch: git push origin feature/YourFeature Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---
