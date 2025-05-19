# 🪣 Tokova

A flexible and efficient token bucket rate limiter implementation for Node.js applications. Tokova provides a simple yet powerful way to implement rate limiting in your applications.

## Features

-   🚀 Simple and intuitive API
-   🔒 Thread-safe operations using async-mutex
-   ⚡️ Efficient token bucket algorithm
-   🔄 Automatic time based token refill
-   🛡️ Written in TypeScript

## Installation

```bash
npm i @cantez/tokova
# or
yarn add @cantez/tokova
# or
bun add @cantez/tokova
```

## Quick Start

```typescript
import { Tokova, TKIntervals } from '@cantez/tokova';

// Create a rate limiter with:
// - 500 tokens maximum
// - 1 second refill interval
// - 10 tokens per interval
const tk = new Tokova({
    limit: 500,
    interval: TKIntervals.SECOND,
    tokensPerInterval: 10,
});

// Consume tokens
try {
    await tk.consume(100);
    // Proceed with your rate-limited operation
} catch (error: any) {
    // Handle rate limit exceeded
    console.error('Rate limit exceeded:', error.message);
}
```

## API Reference

### Constructor Options

```typescript
type TokovaOptions {
    limit: number; // Maximum number of tokens
    interval: number; // Refill interval in milliseconds
    tokensPerInterval: number; // Number of tokens to add per interval
}
```

### Predefined Intervals

```typescript
enum TKIntervals {
    SECOND = 1000,
    MINUTE = 60000,
    HOUR = 3600000,
    DAY = 86400000,
}
```

### Methods

#### `consume(amount: number): Promise<void>`

Consumes the specified number of tokens. Throws an error if there aren't enough tokens available.

```typescript
await tk.consume(100);
```

#### `getTokenCount(): Promise<number>`

Returns the current number of available tokens.

```typescript
const availableTokens = await tk.getTokenCount();
```

#### `destroy(): void`

Cleans up the rate limiter by clearing any intervals. Call this when you're done with the rate limiter.

```typescript
tk.destroy();
```

### Properties

#### `bucket: { tokens: number; lastRefill: number }`

Access the current state of the token bucket.

#### `options: TokovaOptions`

Access the rate limiter configuration.

## Examples

### Basic Rate Limiting

```typescript
const tk = new Tokova({
    limit: 100,
    interval: TKIntervals.MINUTE,
    tokensPerInterval: 10,
});

async function handleRequest() {
    try {
        await tk.consume(1);
        // Process request
    } catch (error) {
        // Handle rate limit exceeded
    }
}
```

### Custom Interval

```typescript
const tk = new Tokova({
    limit: 1000,
    interval: 5000, // 5 seconds
    tokensPerInterval: 100,
});
```

### Checking Available Tokens

```typescript
const availableTokens = await tk.getTokenCount();
if (availableTokens >= requiredTokens) {
    // Proceed with operation
}
```

## Error Handling

```typescript
try {
    await tk.consume(amount);
} catch (error) {
    if (error.message === 'Not enough tokens') {
        // Handle rate limit exceeded
    } else {
        // Handle other errors
    }
}
```

## Best Practices

1. **Resource Cleanup**: Always call `destroy()` when you're done with the rate limiter to prevent memory leaks.

2. **Error Handling**: Always wrap `consume()` calls in try-catch blocks to handle rate limit exceeded cases.

3. **Token Amount**: Choose appropriate token amounts based on your use case. Smaller amounts provide finer-grained control.

4. **Interval Selection**: Choose an interval that makes sense for your application's needs.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Alperen Cantez
