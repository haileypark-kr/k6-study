import { check } from 'k6';
import http from 'k6/http';


export const options = {
    vus: 10,
    duration: '10s',
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
    }
}

export default function () {
    const res = http.get('http://test.k6.io/');
    check(res, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0,
        'verify homepage text': (r) =>
            r.body.includes('Collection of simple web-pages suitable for load testing'),
    });
}