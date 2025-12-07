from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey, RSAPublicKey
from typing import NewType, Optional
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature

EncryptionPrivateKey = NewType("EncryptionPrivateKey", RSAPrivateKey)
EncryptionPublicKey = NewType("EncryptionPublicKey", RSAPublicKey)
SigningPrivateKey = NewType("SigningPrivateKey", RSAPrivateKey)
SigningPublicKey = NewType("SigningPublicKey", RSAPublicKey)
Signature = NewType("Signature", bytes)
CipherText = NewType("CipherText", bytes)


def create_key_pair_for_encryption() -> tuple[
    EncryptionPublicKey, EncryptionPrivateKey
]:
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    return EncryptionPublicKey(private_key.public_key()), EncryptionPrivateKey(
        private_key
    )


def create_key_pair_for_signing() -> tuple[SigningPublicKey, SigningPrivateKey]:
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    return SigningPublicKey(private_key.public_key()), SigningPrivateKey(private_key)


def sign(message: str, private_key: SigningPrivateKey) -> Signature:
    return Signature(
        private_key.sign(
            message.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256(),
        )
    )


def verify(signature: Signature, message: str, public_key: SigningPublicKey) -> bool:
    try:
        public_key.verify(
            signature,
            message.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256(),
        )
        return True
    except InvalidSignature:
        return False


def encrypt(message: str, public_key: EncryptionPublicKey) -> CipherText:
    return CipherText(
        public_key.encrypt(
            (message * 2).encode(),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )
    )


def decrypt(ciphertext: CipherText, private_key: EncryptionPrivateKey) -> Optional[str]:
    msg = private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    if len(msg) % 2 != 0:
        return None
    
    if msg[0:len(msg)/2] != msg[len(msg)/2+1:]:
        return None
    return msg.decode()
