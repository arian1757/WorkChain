> **Reentrancy Attack Protection**

To protect the smart contract from reentrancy attacks, the contract
utilizes the ReentrancyGuard library. Reentrancy attacks are a common
security concern in smart contracts where an attacker can drain a
contract of its funds. Using this library, the smart contract is
designed to prevent nested calls from untrusted contracts, effectively
avoiding such attacks.

**Arithmetic Overflow and Underflow**

This is an attack where a malicious contract can exploit the limited
size of integer variables in Solidity and cause them to wrap around when
they reach their maximum or minimum value. the 0.8.0 compiler
automatically checks for overflow and underflow in arithmetic operations
and reverts the transaction if they occur. This means that the values of
integer variables will not wrap around when they reach their maximum or
minimum limit, and the contract state will not be corrupted by invalid
calculations

**DoS Attacks**

Protecting Against DoS Attacks. We understand the importance of
maintaining a reliable service, even under extreme circumstances.
Therefore, our smart contract includes a pause option. In the event of a
potential denial-of-service (DoS) attack, where an attacker overwhelms
the contract with excessive requests or transactions, the pause option
allows us to temporarily disable certain functions. During the pause,
you cannot send money to the contract. This preventative measure ensures
that our service remains accessible and functional, even when faced with
malicious attempts to disrupt its operation.
