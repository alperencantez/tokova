import { ITokova, TokovaBucket, TokovaOptions } from './types';
import { ErrorHandler } from './decorators';
import { log } from '@clack/prompts';
import { Util } from './util';
import { Mutex } from 'async-mutex';
/**
 * Tokova is a rate limiting library that allows you to limit the rate of requests to your API.
 * A token bucket algorithm implementation to limit the rate of requests.
 *
 * @example
 * ```ts
 * const tk = new Tokova({
 *     limit: 500,
 *     interval: TKIntervals.SECOND,
 *     tokensPerInterval: 10,
 *     isPersistent: true,
 *     reviveFromLatest: true,
 * });
 *
 *await tk.consume(10);
 * ```
 */
class Tokova implements ITokova {
    private _bucket: TokovaBucket;
    private _options: TokovaOptions;
    private _mutex: Mutex;
    private _intervalId: NodeJS.Timeout | null = null;

    get bucket() {
        return this._bucket;
    }

    get options() {
        return this._options;
    }

    constructor(options: TokovaOptions) {
        if (options.isPersistent) {
            this._bucket = Util.loadPersistentBucket({ reviveFromLatest: options.reviveFromLatest });
            log.info(
                'Tokova: `reviveFromLatest` option is set totrue. Loading bucket from persistent storage.\n',
            );
        } else this._bucket = { tokens: 0, lastRefill: 0 };
        this._options = options;
        this._mutex = new Mutex();
        this.bucket.tokens = options.limit;
        this.bucket.lastRefill = Date.now();
        console.log('Initial bucket state:', this.bucket);

        if (options.tokensPerInterval) {
            console.log('Setting up interval token refill...');
            this._intervalId = setInterval(() => {
                this.addTokens(options.tokensPerInterval).catch(console.error);
            }, options.interval);
        }
    }

    public destroy() {
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }

    /**
     * @internal
     * Add tokens to the bucket.
     * @param amount - The amount of tokens to add.
     */
    @ErrorHandler({
        errorMessage: 'Failed to add tokens',
        logErrors: true,
        customHandler: (error, context) => {
            log.info(`Current bucket state: ${JSON.stringify(context.bucket)}`);
        },
    })
    private async addTokens(amount: number): Promise<void> {
        return this._mutex.runExclusive(async () => {
            if (this.bucket.tokens + amount <= this.options.limit) {
                this.bucket.tokens += amount;
            } else {
                this.bucket.tokens = this.options.limit;
            }
        });
    }

    /**
     * Consume tokens from the bucket.
     *
     * @param amount - The amount of tokens to consume.
     *
     * @example
     * ```ts
     * tk.consume(10);
     * ```
     */
    @ErrorHandler({
        errorMessage: 'Failed to consume tokens',
        logErrors: true,
        customHandler: (error, context) => {
            if (error.message.includes('Not enough tokens')) {
                log.error(`Rate limit exceeded. Current tokens: ${context.bucket.tokens}`);
            }
        },
    })
    public async consume(amount: number): Promise<void> {
        const release = await this._mutex.acquire();
        try {
            if (this.bucket.tokens < amount) {
                throw new Error('Not enough tokens');
            }

            this.bucket.tokens -= amount;
        } finally {
            release();
        }
    }

    /**
     * Clears the bucket and resets the last refill time.
     *
     * @example
     * ```ts
     * tk.clearBucket();
     * ```
     */
    public async clearBucket(): Promise<void> {
        const release = await this._mutex.acquire();
        try {
            this.bucket.tokens = 0;
            this.bucket.lastRefill = Date.now();
        } finally {
            release();
        }
    }

    /**
     * Get the current token count.
     *
     * @example
     * ```ts
     * const tokenCount = await tk.getTokenCount();
     * ```
     */
    public async getTokenCount(): Promise<number> {
        const release = await this._mutex.acquire();
        try {
            return this.bucket.tokens;
        } finally {
            release();
        }
    }
}

export { Tokova };
