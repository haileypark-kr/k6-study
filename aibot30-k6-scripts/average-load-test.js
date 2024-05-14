/**
 $ K6_PROMETHEUS_RW_SERVER_URL=http://localhost:19090/api/v1/write \                
    K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true CUSTOM_K6_TEST_TYPE=average-load-test \
    k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S") average-load-test.js  
 */
import { Rate, Counter } from 'k6/metrics';
import { sleep } from 'k6';
import { config } from './configs/import-configs.js';
import { start, findIntent, slotFilling, close } from './http-requests-utils.js';


// Custom Metric 추가
export const RateValidResponse = new Rate('valid_response');
export const CountSessions = new Counter('sessions_alive');

// 설정
const sleepSeconds = config.sleepSeconds;

// k6 options export
export const options = config.k6Options;

/**
 * setup
 */
export function setup() {
    console.log(`RUNNING ${__ENV.CUSTOM_K6_TEST_TYPE}`);
    console.log("CONFIG:", config);
}

/**
 * VU
 */
export default () => {
    const sessionKey = start(RateValidResponse);
    CountSessions.add(1);
    sleep(sleepSeconds);

    findIntent(sessionKey, config.userMessages[0], config.expectedBotMessages[0], RateValidResponse);
    sleep(sleepSeconds);

    slotFilling(sessionKey, config.userMessages[1], config.expectedBotMessages[1], RateValidResponse);
    sleep(sleepSeconds);

    slotFilling(sessionKey, config.userMessages[2], config.expectedBotMessages[2], RateValidResponse);
    sleep(sleepSeconds);

    close(sessionKey, RateValidResponse);
    CountSessions.add(-1);
    sleep(1);
};