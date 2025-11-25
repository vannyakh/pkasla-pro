/**
 * Build a successful API response
 * @param data - The data to return
 * @param message - Optional success message
 * @returns Response object with success: true
 */
export function buildSuccessResponse<T = any>(data: T, message?: string) {
  return {
    success: true,
    data,
    message: message || 'Success',
  };
}

/**
 * Build a successful API response (alias for buildSuccessResponse)
 * @param data - The data to return
 * @param message - Optional success message
 * @returns Response object with success: true
 */
export function useResponseSuccess<T = any>(data: T, message?: string) {
  return buildSuccessResponse(data, message);
}

/**
 * Build a paginated success response
 * @param page - Current page number
 * @param pageSize - Items per page
 * @param list - Array of items to paginate
 * @param options - Optional message
 * @returns Response object with paginated data
 */
export function usePageResponseSuccess<T = any>(
  page: number | string,
  pageSize: number | string,
  list: T[],
  { message = 'Success' } = {},
) {
  const pageData = pagination(
    Number.parseInt(`${page}`),
    Number.parseInt(`${pageSize}`),
    list,
  );

  return buildSuccessResponse(
    {
      items: pageData,
      total: list.length,
    },
    message,
  );
}

/**
 * Build an error API response
 * @param error - Error message or error object
 * @param message - Optional message (defaults to error if string)
 * @returns Response object with success: false
 */
export function useResponseError(error: string | Error, message?: string) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  return {
    success: false,
    error: errorMessage,
    message: message || errorMessage,
  };
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function pagination<T = any>(
  pageNo: number,
  pageSize: number,
  array: T[],
): T[] {
  const offset = (pageNo - 1) * Number(pageSize);
  return offset + Number(pageSize) >= array.length
    ? array.slice(offset)
    : array.slice(offset, offset + Number(pageSize));
}