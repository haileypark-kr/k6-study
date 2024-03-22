import http from 'k6/http';
import { Trend } from 'k6/metrics';

export const options = {
  vus: 80,
  duration: '10s'
}

const myTrend = new Trend('custom_waiting_time');

export default function () {
  const r = http.get('https://httpbin.test.k6.io');
  myTrend.add(r.timings.waiting);
}