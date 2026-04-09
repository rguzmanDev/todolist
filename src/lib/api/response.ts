import { NextResponse } from 'next/server'

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status })
}

export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export function withErrorHandler(
  handler: () => NextResponse | Promise<NextResponse>
): Promise<NextResponse> {
  return Promise.resolve(handler()).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return apiError(message, 500)
  })
}
