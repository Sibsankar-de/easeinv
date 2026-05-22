import { MiddlewareContext } from '@/types/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from './error-handler';

type Handler = (req: NextRequest, context?: MiddlewareContext, params?: Record<string,any>) => Promise<NextResponse>;

export function asyncHandler(handler: Handler): Handler {
    return async (req: NextRequest, context?: MiddlewareContext, params?: Record<string,any>) => {
        try {
            return await handler(req, context, params);
        } catch (error) {
            const err = error as ApiError;

            console.error('❌ Error:', err);

            return NextResponse.json(
                {
                    success: false,
                    message: err.message || "Internal Server Error",
                    errors: err.errors || [],
                },
                { status: err.statusCode || 500 }
            );
        }
    };
}
