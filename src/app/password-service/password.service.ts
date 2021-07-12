import sha256 from 'crypto-js/sha256';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';

export class PasswordService {

  constructor() { }

  static encode = (value: string): string => Base64.stringify(hmacSHA512(sha256(value), "somepig"));
}
