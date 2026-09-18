export const KONG_CONFIG = {
    adminUrl: 'http://localhost:8001',
    services: [
        {
            name: 'auth-service',
            url: 'http://host.docker.internal:3001',
            routes: [
                {
                    name: 'auth-route',
                    paths: ['/auth'],
                },
            ],
            plugins: [
                {
                    name: 'cors',
                    config: {
                        origins: ['*'],
                        credentials: true,
                        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                        headers: ['Content-Type', 'Authorization'],
                    },
                },
                {
                    name: 'jwt',
                    config: {
                        key_claim_name: 'aud',
                        secret_is_base64: false,
                    },
                },
            ],
        },
    ],
};