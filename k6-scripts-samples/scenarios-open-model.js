import http from 'k6/http';

export const options = {
  scenarios: {
    open_model: {
      executor: 'constant-arrival-rate',
      rate: 2, // number of iterations per `timeUnit`
      timeUnit: '1s', // default: 1s
      duration: '1m',
      preAllocatedVUs: 20, // target iteration rate를 만족하기 위해 초기화하는 VU의 개수. 부족하면 dropped iteration 이 되고, 넘치면 extra VU는 idle 상태가 된다.
    },
  },
};

export default function () {
  // With the open model arrival rate executor config above,
  // new VU iterations will start at a rate of 1 every second,
  // and we can thus expect to get 60 iterations completed
  // for the full 1m test duration.
  http.get('https://httpbin.test.k6.io/delay/6');
}