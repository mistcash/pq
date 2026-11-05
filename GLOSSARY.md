# pqmsg

A messaging layer on Ethereum where users register, then exchange encrypted messages stored publicly on-chain.

## Language

**User**:
A wallet address that has registered a User Key.
_Avoid_: member, account

**User Key**:
The public value a User registers; a placeholder until channel key encryption exists.
_Avoid_: registration key, public key

**Channel**:
A one-way conversation from one sender to one recipient; replies travel on the reverse Channel.
_Avoid_: session, conversation, thread

**Channel Key**:
The secret shared by a Channel's two ends, from which all its Message Keys derive.
_Avoid_: master key, session key

**Fixed Sender**:
The single account that submits messages on users' behalf, standing in for a future relayer.
_Avoid_: relayer, burner

**Message Index**:
A message's position within its Channel, known only to the two parties.
_Avoid_: nonce, counter

**Message Key**:
The per-message secret derived from a Channel Key and a Message Index.
_Avoid_: msgk, session key

**Message ID**:
The public identifier under which a message is stored on-chain.
_Avoid_: message hash

**Ciphertext Element**:
One of the two encrypted 31-byte halves of a message, as stored on-chain.
_Avoid_: message element, chunk
