import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';

@Injectable()
export class CryptoService {
 private readonly algorithm = 'aes-256-cbc';
 private readonly secretKey: Buffer;

 constructor() {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
   throw new Error(
    'Invalid ENCRYPTION_KEY length. Must be 32 bytes (64 hex chars)',
   );
  }

  this.secretKey = Buffer.from(keyHex, 'hex');
 }

 encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(this.algorithm, this.secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
 }

 decrypt(data: string): string {
  const [ivHex, encrypted] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv(this.algorithm, this.secretKey, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
 }
 hashForSearch(text: string): string {
  return createHmac('sha256', process.env.SEARCH_HMAC_KEY)
   .update(text.toLowerCase().trim())
   .digest('hex');
 }
}
