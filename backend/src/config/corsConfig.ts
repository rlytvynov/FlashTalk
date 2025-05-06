const httpCorsOptions = {
    origin: [
        'http://localhost:3000', // Your local dev server
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
}
const webSocketCorsOptions = {
    origin: [
        'http://localhost:3000',
    ],
    allowedHeaders: ['Authorization', 'ngrok-skip-browser-warning'],
    methods: ['GET', 'POST'],
}
export {httpCorsOptions, webSocketCorsOptions}