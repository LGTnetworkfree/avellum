/**
 * Production-ready logging utility
 * Debug logs are only output in development mode
 */

const isDev = process.env.NODE_ENV === 'development';

type LogArgs = unknown[];

/**
 * Logger utility with environment-aware logging levels
 */
export const logger = {
    /**
     * Debug level - only logs in development
     * Use for detailed debugging information
     */
    debug: (...args: LogArgs): void => {
        if (isDev) {
            console.log('[DEBUG]', ...args);
        }
    },

    /**
     * Info level - logs in all environments
     * Use for general operational information
     */
    info: (...args: LogArgs): void => {
        console.log('[INFO]', ...args);
    },

    /**
     * Warn level - logs in all environments
     * Use for potentially problematic situations
     */
    warn: (...args: LogArgs): void => {
        console.warn('[WARN]', ...args);
    },

    /**
     * Error level - logs in all environments
     * Use for error conditions
     */
    error: (...args: LogArgs): void => {
        console.error('[ERROR]', ...args);
    },
};

/**
 * Create a scoped logger with a prefix
 * Useful for module-specific logging
 */
export function createScopedLogger(scope: string) {
    return {
        debug: (...args: LogArgs): void => logger.debug(`[${scope}]`, ...args),
        info: (...args: LogArgs): void => logger.info(`[${scope}]`, ...args),
        warn: (...args: LogArgs): void => logger.warn(`[${scope}]`, ...args),
        error: (...args: LogArgs): void => logger.error(`[${scope}]`, ...args),
    };
}
