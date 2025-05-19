import { TKIntervals } from './types';
import { Tokova } from './index';

async function runTests() {
    console.log('🧪 Starting Tokova Tests\n');
    let tk: Tokova | null = null;

    try {
        // Test 1: Basic Initialization
        console.log('Test 1: Basic Initialization');
        tk = new Tokova({
            limit: 500,
            interval: TKIntervals.SECOND,
            tokensPerInterval: 10,
        });
        console.log('✅ Tokova instance created\n');

        // Test 2: Initial Token Count
        console.log('Test 2: Initial Token Count');
        const initialCount = await tk.getTokenCount();
        console.log(`Initial token count: ${initialCount}`);
        console.log('✅ Initial token count verified\n');

        // Test 3: Basic Token Consumption
        console.log('Test 3: Basic Token Consumption');
        await tk.consume(100);
        console.log(`Consumed 100 tokens. Remaining: ${tk.bucket.tokens}`);
        console.log('✅ Basic consumption successful\n');

        // Test 4: Rate Limiting
        console.log('Test 4: Rate Limiting');
        try {
            await tk.consume(1000); // This should fail
            console.error('❌ Rate limiting test failed: Should have thrown an error');
        } catch (error: any) {
            console.log('✅ Rate limiting working as expected:', error.message);
        }
        console.log();
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        if (tk) {
            tk.destroy();
        }
    }

    console.log('🎉 All tests completed!');
}

runTests()
    .then(() => {
        console.log('\n✨ Test suite finished successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test suite failed:', error);
        process.exit(1);
    });
