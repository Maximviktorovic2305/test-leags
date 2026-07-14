export type UploadedAvatar = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

export type StoredAvatar = {
  data: Buffer;
  mimeType: string;
};
