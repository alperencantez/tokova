import { log } from '@clack/prompts';

export class Util {
    static persistBucket(key: string, bucket: any) {
        const fs = require('fs');
        const dir = './tokova/persist/bucket-state';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(`./tokova/persist/bucket-state/tk-${key}.json`, JSON.stringify(bucket));
        log.success(`Info: Current bucket persisted to "tokova/persist/bucket-state/tk-${key}.json"`);
    }

    static loadPersistentBucket({ key, reviveFromLatest }: { key?: string; reviveFromLatest?: boolean }) {
        if (!key && !reviveFromLatest) {
            throw new Error('TokovaError: `key` or `reviveFromLatest` must be provided');
        }

        const fs = require('fs');
        if (reviveFromLatest) {
            if (!fs.existsSync('tokova/persist/bucket-state')) {
                throw new Error(
                    'TokovaError: No bucket state logs found. Make sure to persist buckets first.',
                );
            }
            const files = fs.readdirSync(`tokova/persist/bucket-state`);
            const latestFile = files.sort().pop();
            const bucket = fs.readFileSync(`tokova/persist/bucket-state/${latestFile}`, 'utf8');
            return JSON.parse(bucket);
        }

        const bucket = fs.readFileSync(`tokova/persist/bucket-state/tk-${key}.json`, 'utf8');
        return JSON.parse(bucket);
    }
}
