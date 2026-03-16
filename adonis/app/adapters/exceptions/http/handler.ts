import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { HttpError } from '@adonisjs/http-server/types'

type ErrorPayloadItem = {
  message: string
  field?: string
  rule?: string
  code?: string
}

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    return super.handle(error, ctx)
  }

  async renderErrorAsJSON(error: HttpError, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      errors: this.formatErrors(error),
    })
  }

  async renderValidationErrorAsJSON(error: HttpError, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      errors: this.formatErrors(error),
    })
  }

  async renderErrorAsJSONAPI(error: HttpError, ctx: HttpContext) {
    return this.renderErrorAsJSON(error, ctx)
  }

  async renderValidationErrorAsJSONAPI(error: HttpError, ctx: HttpContext) {
    return this.renderValidationErrorAsJSON(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }

  private formatErrors(error: HttpError): ErrorPayloadItem[] {
    if (Array.isArray(error.messages)) {
      return error.messages.map((entry) => {
        if (typeof entry === 'string') {
          return { message: entry }
        }

        if (entry && typeof entry === 'object') {
          const item = entry as Partial<ErrorPayloadItem>

          return {
            message: item.message ?? error.message,
            ...(item.field ? { field: item.field } : {}),
            ...(item.rule ? { rule: item.rule } : {}),
            ...(item.code ? { code: item.code } : {}),
          }
        }

        return { message: error.message }
      })
    }

    return [
      {
        message: error.message,
        ...(typeof error.code === 'string' ? { code: error.code } : {}),
      },
    ]
  }
}
