import { detectAvatarMimeType } from './detect-avatar-mime-type';

describe('detectAvatarMimeType', () => {
  it.each([
    [
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      'image/png',
    ],
    [Buffer.from([0xff, 0xd8, 0xff, 0xe0]), 'image/jpeg'],
    [Buffer.from('RIFF0000WEBP'), 'image/webp'],
  ])('detects an allowed image signature', (buffer, expected) => {
    expect(detectAvatarMimeType(buffer)).toBe(expected);
  });

  it('rejects unknown and truncated content', () => {
    expect(detectAvatarMimeType(Buffer.from('not-an-image'))).toBeNull();
    expect(detectAvatarMimeType(Buffer.from([0x89, 0x50]))).toBeNull();
  });
});
