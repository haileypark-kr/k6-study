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

로컬 환경에서는 `prometheus_k6` network가 host와 연결되어 있지 않기 때문에 localhost로 channelgw를 호출할 수 없음.
EPC에서는 실행 가능.

```shell
# average load test
docker run --rm --network prometheus_k6 \
-v $(pwd):/mnt
-e K6_PROMETHEUS_RW_SERVER_URL=http://prometheus:9090/api/v1/write \
-e K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
-e CUSTOM_K6_TEST_TYPE=average-load-test \
-i grafana/k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S")  - <k6-scripts/average-load-test.js

# smoke test
docker run --rm --network prometheus_k6 \
-v $(pwd):/mnt
-e K6_PROMETHEUS_RW_SERVER_URL=http://prometheus:9090/api/v1/write \
-e K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
-e CUSTOM_K6_TEST_TYPE=smoke-test \
-i grafana/k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S")  - <k6-scripts/average-load-test.js

# Soak test
docker run --rm --network prometheus_k6 \
-v $(pwd):/mnt
-e K6_PROMETHEUS_RW_SERVER_URL=http://prometheus:9090/api/v1/write \
-e K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
-e CUSTOM_K6_TEST_TYPE=soak-test \
-i grafana/k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S")  - <k6-scripts/average-load-test.js

# Stress test
docker run --rm --network prometheus_k6 \
-v $(pwd):/mnt
-e K6_PROMETHEUS_RW_SERVER_URL=http://prometheus:9090/api/v1/write \
-e K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
-e CUSTOM_K6_TEST_TYPE=stress-test \
-i grafana/k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S")  - <k6-scripts/average-load-test.js

# breakpoint test
docker run --rm --network prometheus_k6 \
-v $(pwd):/mnt
-e K6_PROMETHEUS_RW_SERVER_URL=http://prometheus:9090/api/v1/write \
-e K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true \
-e CUSTOM_K6_TEST_TYPE=breakpoint-test \
-i grafana/k6 run -o experimental-prometheus-rw --tag testid=$(date "+%Y%m%d-%H%M%S")  - <k6-scripts/breakpoint-test.js
```



# 그라파나에서 확인
