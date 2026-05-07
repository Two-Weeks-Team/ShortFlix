import { HttpException } from "@nestjs/common";
import type { Problem, ProblemFieldError } from "../dtos/common.dto";

/** Problem URI base. Mirrors the prefix used by the OpenAPI spec examples. */
export const PROBLEM_URI = "https://shortflix.run.app/problems";

export type ProblemKind =
  | "bad-request"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "idempotency-conflict"
  | "quest-already-completed"
  | "quest-progress-insufficient"
  | "validation"
  | "rate-limited"
  | "service-unavailable";

const STATUS: Record<ProblemKind, number> = {
  "bad-request": 400,
  unauthorized: 401,
  forbidden: 403,
  "not-found": 404,
  "idempotency-conflict": 409,
  "quest-already-completed": 409,
  "quest-progress-insufficient": 422,
  validation: 422,
  "rate-limited": 429,
  "service-unavailable": 503,
};

const TITLE: Record<ProblemKind, string> = {
  "bad-request": "Bad Request",
  unauthorized: "Unauthorized",
  forbidden: "Forbidden",
  "not-found": "Not Found",
  "idempotency-conflict": "Idempotency Conflict",
  "quest-already-completed": "Quest Already Completed",
  "quest-progress-insufficient": "Quest Progress Insufficient",
  validation: "Validation Failed",
  "rate-limited": "Rate Limited",
  "service-unavailable": "Service Unavailable",
};

/**
 * Throwable HttpException whose JSON body conforms to RFC 7807.
 * The global filter (HttpExceptionFilter) sets Content-Type to application/problem+json.
 */
export class ProblemException extends HttpException {
  constructor(
    public readonly kind: ProblemKind,
    options?: {
      detail?: string;
      instance?: string;
      traceId?: string;
      lang?: string;
      errors?: ProblemFieldError[];
    },
  ) {
    const body: Problem = {
      type: `${PROBLEM_URI}/${kind}`,
      title: TITLE[kind],
      status: STATUS[kind],
      ...(options?.detail !== undefined && { detail: options.detail }),
      ...(options?.instance !== undefined && { instance: options.instance }),
      ...(options?.traceId !== undefined && { traceId: options.traceId }),
      ...(options?.lang !== undefined && { lang: options.lang }),
      ...(options?.errors !== undefined && { errors: options.errors }),
    };
    super(body, STATUS[kind]);
  }
}
