import http from 'k6/http';

export const options = {
  vus: 10,
  duration: '10s'
}

export default function () {
  for (let id = 1; id <= 10; id++) {
    http.get('https://httpbin.test.k6.io/', {
      tags: { name: 'httpbin-test' }
    })
  }
}