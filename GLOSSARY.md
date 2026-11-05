# pqmsg

A messaging layer on Ethereum where users register, then exchange encrypted messages stored publicly on-chain.

## Language

**Channel**:
A one-way conversation from one sender to one recipient; replies travel on the reverse Channel.
_Avoid_: conversation, thread

**Message Index**:
A message's position within its Channel, known only to the two parties.
_Avoid_: nonce, counter

**Message Key**:
The per-message secret from which a message's Message ID and encryption are derived.
_Avoid_: msgk, session key

**Message ID**:
The public identifier under which a message is stored on-chain.
_Avoid_: message hash

**Ciphertext Element**:
One of the two encrypted 31-byte halves of a message, as stored on-chain.
_Avoid_: message element, chunk
