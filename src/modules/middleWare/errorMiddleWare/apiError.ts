class ApiError {
  status: number
  message: string
  constructor(status: number, message: string) {
    this.status = status
    this.message = message
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, message)
  }

  static unauthorizedError(message: string): ApiError {
    return new ApiError(401, message)
  }

  static forbidden(message: string): ApiError {
    return new ApiError(403, message)
  }

  static notFound(message: string): ApiError {
    return new ApiError(404, message)
  }

  static requestTimeout(message: string): ApiError {
    return new ApiError(408, message)
  }

  static gone(message: string): ApiError {
    return new ApiError(410, message)
  }

  static lengthRequired(message: string): ApiError {
    return new ApiError(411, message)
  }

  static requestEntityTooLarge(message: string): ApiError {
    return new ApiError(412, message)
  }

  static requestUrlTooLong(message: string): ApiError {
    return new ApiError(414, message)
  }

  static internalServerError(message: string): ApiError {
    return new ApiError(500, message)
  }

  static httpVersionNotSupported(message: string): ApiError {
    return new ApiError(505, message)
  }

  static unknownError(message: string): ApiError {
    return new ApiError(520, message)
  }
}
export { ApiError }
