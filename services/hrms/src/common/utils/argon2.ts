import * as argon2 from 'argon2';

export class Argon2Util {
  private static readonly options = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3, // iterations
    parallelism: 1,
    hashLength: 32,
  };

  static async hash(password: string): Promise<string> {
    return argon2.hash(password, this.options);
  }

  static async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  static async generateRandomBytes(length: number = 32): Promise<string> {
    const buffer = await argon2.hash(Math.random().toString(), {
      ...this.options,
      raw: true,
    });
    return buffer.slice(0, length).toString('hex');
  }
}
