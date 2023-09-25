# Orthanc

``` 도커 이미지 가져와 서버 연결
docker pull jodogne/orthanc
docker run -p 4242:4242 -p 8042:8042 --rm jodogne/orthanc:1.12.1

 DICOM 파일을 Orthanc 서버의 인스턴스로 업로드
curl.exe -X POST http://localhost:8042/instances --data-binary '@CT.X.1.2.276.0.7230010.dcm'

DICOM 파일을 Orthanc 서버의 인스턴스로 업로드
curl.exe -X POST http://localhost:8042/instances --data-binary '@1.3.46.670589.30.1.6.1.1625523293.1512518965140.2.dcm'


DICOM 파일의 시리즈 이동
curl http://localhost:8042/patients

특정 스터디의 모든 시리즈 목록 가져오기
curl http://localhost:8042/studies/"StudyID"/series

특정 시리즈의 모든 인스턴스 목록 가져오기
curl http://localhost:8042/series/"SeriesID"/instances

특정 인스턴스의 DICOM 파일 다운로드
curl http://localhost:8042/instances/"InstanceID"/file > Instance.dcm



파일 다운
curl http://localhost:8042/instances/"1c2b8555-3accd2d6-52170a5c-76fd0ede-d870da08"/file > Instance.dcm


도커 목록
docker ps

docker stop
```