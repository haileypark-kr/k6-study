# 실행 방법
epc 브랜치에 있는 이 파일은 EPC에서 실행하는 방법에 대해서 기술한다.

## 실행 전
1. prometheus endpoint 확인
    - 예시에는 http://localhost:19090 사용
2. prometheus 실행 옵션에 `enable-feature=native-histograms` 확인
3. 로그 레벨 ERROR 확인


## k6 docker로 실행

실행 스크립트가 있는 경로를 컨테이너 내 `/mnt` 에 마운트해야한다.

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
