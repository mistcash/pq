# pqmsg

A messaging layer on Ethereum where users register, then exchange encrypted messages stored publicly on-chain.

## Language

**User**:
A wallet address that has registered a User Key.
_Avoid_: member, account

**User Key**:
The public value a User registers; a placeholder until channel key encryption exists.
_Avoid_: registration key, public key

**User Index**:
A User's permanent position in the list of registered Users.
_Avoid_: recipient index, user id

**Sender Key**:
A User's private secret, from which every Channel Key they open is derived.
_Avoid_: root key, master key, User Key

**Channel**:
A one-way conversation from one sender to one recipient; replies travel on the reverse Channel.
_Avoid_: session, conversation, thread

**Channel Key**:
The secret shared by a Channel's two ends, from which all its Message Keys derive.
_Avoid_: master key, session key

**Channel Key Hash**:
The public hash of a Channel Key, which is all the chain stores about a Channel's key.
_Avoid_: public parameter, commitment

**Fixed Sender**:
The single account that submits Channel openings and messages on users' behalf, standing in for a future relayer.
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
