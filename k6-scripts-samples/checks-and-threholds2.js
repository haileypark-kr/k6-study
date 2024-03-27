import http from 'k6/http';
import { sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { check } from 'k6';

export const options = {
    vus: 10,
    duration: '10s',
    thresholds: {
        'http_req_duration{type:API}': ['p(95)<500'], // threshold on API requests only
        'http_req_duration{name:crocodiles-1}': ['p(95)<200'], // threshold on static content only
        'http_req_duration{name:crocodiles-2}': ['p(95)<100'], // threshold on static content only
    },
};

export default function () {
    const res1 = http.get('http://test.k6.io/', {
        tags: { type: 'API', name: "crocodiles-1" },
    });
    const res2 = http.get('http://test.k6.io/', {
        tags: { type: 'API', name: "crocodiles-2"},
    });

    check(res1, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0
    });

    check(res2, {
        'is status 200': (r) => r.status === 200,
        'body size is bigger than 0': (r) => r.body.length > 0
    });

    sleep(1);
}