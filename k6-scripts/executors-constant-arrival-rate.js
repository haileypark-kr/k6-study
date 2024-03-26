import http from 'k6/http';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',

      // How long the test lasts
      duration: '30s',

      // How many iterations per timeUnit
      rate: 60,

      // Start `rate` iterations per second
      timeUnit: '1s',

      // Pre-allocate 2 VUs before starting the test
      preAllocatedVUs: 10,

      // Spin up a maximum of 50 VUs to sustain the defined
      // constant arrival rate.
      maxVUs: 50,
    },
  },
};

export default function () {
  http.get('https://test.k6.io/contacts.php');
}