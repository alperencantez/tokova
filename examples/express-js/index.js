const express = require('express');
const { Tokova } = require('@cantez/tokova');
const { TKIntervals } = require('@cantez/tokova/dist/types');

const PORT = 3000;
const app = express();

const tk = new Tokova({
    limit: 500,
    interval: TKIntervals.SECOND * 10,
    tokensPerInterval: 10,
    isPersistent: false,
});

app.use(async (_, res, next) => {
    try {
        await tk.consume(10);
        console.log('Tokova Status: ', tk.bucket);
        next();
    } catch (err) {
        return res.status(429).send('Too Many Requests');
    }
});

app.get('/clear', async (req, res) => {
    tk.clearBucket();
    res.send(`Bucket cleared: ${JSON.stringify(tk.bucket)}`);
});

app.get('/', (req, res) => {
    res.send('Hello from Tokova + Express!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
