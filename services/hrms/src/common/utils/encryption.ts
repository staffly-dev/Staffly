import * as crypto from 'crypto';

export class EncryptionUtil {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly keyLength = 32; // 256 bits
  private static readonly ivLength = 16; // 128 bits
  private static readonly tagLength = 16; // 128 bits

  private static getEncryptionKey(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret || secret.length < 64) {
      throw new Error('ENCRYPTION_SECRET must be at least 64 characters long');
    }
    return crypto.scryptSync(secret, 'salt', this.keyLength);
  }

  static encrypt(text: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.ivLength);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    cipher.setAAD(Buffer.from('staffly', 'utf8'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  static decrypt(encryptedData: {
    encrypted: string;
    iv: string;
    tag: string;
  }): string {
    const key = this.getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAAD(Buffer.from('staffly', 'utf8'));
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  static encryptField(field: string | number | null): string | null {
    if (field === null || field === undefined) {
      return null;
    }

    const encrypted = this.encrypt(String(field));
    return `${encrypted.encrypted}:${encrypted.iv}:${encrypted.tag}`;
  }

  static decryptField(encryptedField: string | null): string | null {
    if (!encryptedField) {
      return null;
    }

    const parts = encryptedField.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted field format');
    }

    return this.decrypt({
      encrypted: parts[0],
      iv: parts[1],
      tag: parts[2],
    });
  }

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
