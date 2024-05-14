# 실행 방법

## 실행 전
1. prometheus endpoint 확인
    - 예시에는 http://localhost:19090 사용
2. prometheus 실행 옵션에 `enable-feature=native-histograms` 확인
3. 로그 레벨 ERROR 확인

## k6 바로 실행
### `average-load-test`, `smoke-test`, `soak-test`, `stress-test`
```shell
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:19090/api/v1/write \
K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
CUSTOM_K6_TEST_TYPE={테스트 종류. `average-load-test`, `smoke-test`, `soak-test`, `stress-test` 중 하나 입력} \
k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S") average-load-test.js

# Average load test
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:19090/api/v1/write \
K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
CUSTOM_K6_TEST_TYPE=average-load-test \
k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S") average-load-test.js

# Smoke test
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:19090/api/v1/write \
K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
CUSTOM_K6_TEST_TYPE=smoke-test \
k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S") average-load-test.js

# Soak test
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:19090/api/v1/write \
K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
CUSTOM_K6_TEST_TYPE=soak-test \
k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S") average-load-test.js

# Stress test
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:19090/api/v1/write \
K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
CUSTOM_K6_TEST_TYPE=stress-test \
k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S") average-load-test.js
```

### `breakpoint-test`
```shell
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:19090/api/v1/write \
K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
CUSTOM_K6_TEST_TYPE=breakpoint-test \
k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S") breakpoint-test.js
```

## k6 docker로 실행
TODO



# 그라파나에서 확인
