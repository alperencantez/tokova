/**
 * Popular intervals for the token bucket in a human-readable time format, expects milliseconds.
 */
export enum TKIntervals {
    DAY = 86400000,
    HOUR = 3600000,
    MINUTE = 60000,
    SECOND = 1000,
}

/**
 * The bucket type for the tokens.
 */
export type TokovaBucket = {
    tokens: number;
    lastRefill: number;
};

/**
 * @internal
 * Initialization properties for the Tokova library.
 */
export type TokovaOptions = {
    readonly limit: number;
    readonly interval: TKIntervals | number;
    readonly tokensPerInterval: number;
    readonly isPersistent?: boolean;
    readonly reviveFromLatest?: boolean;
};

/**
 * @internal
 * The interface for the Tokova library.
 */
export interface ITokova {
    readonly bucket: TokovaBucket;
    readonly options: TokovaOptions;
}
