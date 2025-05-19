import Tokova from '.';
import { Util } from './util';
import { log } from '@clack/prompts';

export function ErrorHandler(opt: {
    errorMessage?: string;
    logErrors?: boolean;
    customHandler?: (error: Error, context: any) => void;
}) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (error) {
                const bucket = (this as Tokova).bucket;
                const options = (this as Tokova).options;

                Util.persistBucket(Date.now().toString(), bucket);

                if (opt.logErrors) {
                    log.error(
                        `Error in ${propertyKey}: ${JSON.stringify({
                            error,
                            currentTokens: bucket.tokens,
                            limit: options.limit,
                        })}`,
                    );
                }

                if (opt.customHandler) opt.customHandler(error as Error, this);
                if (error instanceof Error) {
                    throw new Error(opt.errorMessage || `TokovaError in "${propertyKey}": ${error.message}`);
                }
                throw error;
            }
        };

        return descriptor;
    };
}
