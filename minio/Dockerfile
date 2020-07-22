FROM minio/minio:RELEASE.2020-01-03T19-12-21Z

RUN wget https://dl.min.io/client/mc/release/linux-amd64/mc
RUN chmod +x mc
RUN cp mc /usr/bin

ADD ./policy.json /export/.minio.sys/buckets/test/policy.json
