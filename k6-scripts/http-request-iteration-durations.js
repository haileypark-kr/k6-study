import { sleep } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 10,
  // durations: 10,
  iterations: 10,
  thresholds: {
    'iteration_duration{scenario:default}': [`max>=0`], // 디폴트 시나리오의 iteration의 sample만 수집한다.
    'iteration_duration{group:::setup}': [`max>=0`],    // setup 단계의 iteration sample만 수집한다.
    'iteration_duration{group:::teardown}': [`max>=0`], // teardown 단계의 iteration sample만 수집한다.
    'http_req_duration{scenario:default}': [`max>=0`],  // 디폴트 시나리오의 http request duration sample만 수집한다.
  },
};

export function setup() {
  http.get('https://httpbin.test.k6.io/delay/5');
}

export default function () {
  http.get('http://test.k6.io/?where=default');
  sleep(0.5);
}

export function teardown() {
  http.get('https://httpbin.test.k6.io/delay/3');
  sleep(5);
}