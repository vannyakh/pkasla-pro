interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export const buildSuccessResponse = <T>(data: T, meta?: Meta) => ({
  success: true,
  data,
  meta,
});

export const buildMessageResponse = (message: string) => ({
  success: true,
  message,
});

