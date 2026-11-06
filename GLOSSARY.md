# pqmsg

A messaging layer on Ethereum where users register, then exchange encrypted messages stored publicly on-chain.

## Language

**User**:
A wallet address that has registered a User Key.
_Avoid_: member, account

**User Key**:
The Kyber512 public key a User registers, derived from their Sender Key; Channel Keys opened to them are encrypted to it.
_Avoid_: registration key, public key

**User Index**:
A User's permanent position in the list of registered Users.
_Avoid_: recipient index, user id

**Sender Key**:
A User's private secret, from their wallet and their Password, from which their User Key and every Channel Key they open are derived.
_Avoid_: root key, master key, User Key

**Password**:
The secret a User picks when registering and types to unlock their Sender Key; there's no reset.
_Avoid_: passphrase, PIN

**Channel**:
A one-way conversation from one sender to one recipient; replies travel on the reverse Channel.
_Avoid_: session, conversation, thread

**Channel Key**:
The secret shared by a Channel's two ends, from which all its Message Keys derive.
_Avoid_: master key, session key

**Channel Key Hash**:
The public hash of a Channel Key, against which a recipient checks a Channel Key they decrypted.
_Avoid_: public parameter, commitment

**Encrypted Channel Key**:
A Channel's Channel Key encrypted to its recipient's User Key, as 37 field elements on-chain.
_Avoid_: channel ciphertext

**Encrypted Sender**:
The User Index of a Channel's sender, padded with a hash of the Channel Key, so only the Channel's two ends can read it.
_Avoid_: sender, from

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
