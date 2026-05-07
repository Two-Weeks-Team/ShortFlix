import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import type { Problem } from "../../dtos/common.dto";
import { PROBLEM_URI } from "../problem";

/**
 * Global filter that converts all errors into RFC 7807 application/problem+json bodies.
 * Mirrors the response set declared in openapi.yaml (#/components/responses/*).
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: Problem;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const raw = exception.getResponse();
      if (typeof raw === "object" && raw !== null && "type" in raw && "title" in raw) {
        body = raw as Problem;
      } else {
        body = {
          type: `${PROBLEM_URI}/bad-request`,
          title: typeof raw === "string" ? raw : "Error",
          status,
          ...(typeof raw === "object" && raw !== null && "message" in raw
            ? { detail: String((raw as { message: unknown }).message) }
            : {}),
        };
      }
    } else {
      const err = exception as Error;
      this.logger.error(err.message ?? String(err), err.stack);
      body = {
        type: `${PROBLEM_URI}/internal`,
        title: "Internal Server Error",
        status,
        detail: err.message ?? "Unknown",
      };
    }

    res.setHeader("Content-Type", "application/problem+json");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(status).send(JSON.stringify({ ...body, instance: req.originalUrl }));
  }
}
