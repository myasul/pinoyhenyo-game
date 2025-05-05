import { useCallback, useLayoutEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEvent<T extends (...args: any[]) => any>(handler: T): T{
    const handlerRef = useRef(handler);

    // In a real implementation, this would run before layout effects
    useLayoutEffect(() => {
        handlerRef.current = handler;
    });

    return useCallback(((...args: Parameters<T>): ReturnType<T> => {
        return handlerRef.current(...args)
    }) as T, [])
}
