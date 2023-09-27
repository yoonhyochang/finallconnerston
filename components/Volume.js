// 필요한 모듈과 라이브러리를 임포트
import {
  RenderingEngine,
  Enums,
  setVolumesForViewports,
  volumeLoader,
} from "@cornerstonejs/core";
import {
  createImageIdsAndCacheMetaData,
  initCornerstone,
  setTitleAndDescription,
} from "../utils/cornerstone3D";
import { useEffect, useRef, useState } from "react";

import managerInit from "./managerInit";

// 필요한 Enum 값을 디스트럭처링
const { ViewportType } = Enums;

// 주요 실행 함수
async function run(element1, element2) {
  // Cornerstone 및 관련 라이브러리 초기화
  await initCornerstone();

  // Get Cornerstone imageIds and fetch metadata into RAM
  // Cornerstone 이미지 ID 및 메타데이터 획득
  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID:
      "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
    SeriesInstanceUID:
      "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
    wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
  });

  const volumeName = "PROSTATE_VOLUME"; // Id of the volume less loader prefix
  const volumeLoaderScheme = "cornerstoneStreamingImageVolume"; // Loader id which defines which volume loader to use
  const volumeId = `${volumeLoaderScheme}:${volumeName}`; // VolumeId with loader id + volume id

  // Define a volume in memory
  const volume = await volumeLoader.createAndCacheVolume(volumeId, {
    imageIds,
  });

  // 렌더링 엔진과 뷰포트 설정
  const renderingEngineId = "myRenderingEngine";
  const renderingEngine = new RenderingEngine(renderingEngineId);

  const viewportId1 = "CT_AXIAL";
  const viewportId2 = "CT_SAGITTAL";

  const viewportInput = [
    {
      viewportId: viewportId1,
      element: element1,
      type: ViewportType.ORTHOGRAPHIC,
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
      },
    },
    {
      viewportId: viewportId2,
      element: element2,
      type: ViewportType.ORTHOGRAPHIC,
      defaultOptions: {
        orientation: Enums.OrientationAxis.SAGITTAL,
      },
    },
  ];

  renderingEngine.setViewports(viewportInput);

  // Set the volume to load
  volume.load();

  setVolumesForViewports(
    renderingEngine,
    [{ volumeId }],
    [viewportId1, viewportId2]
  );
  renderingEngine.renderViewports([viewportId1, viewportId2]);
}

// 뷰포트 컴포넌트
export default function Viewport() {
  // 참조와 상태 설정
  const volume1 = useRef(null);
  const volume2 = useRef(null);
  const [managers, setManagers] = useState(null);
  const defaultConfig = {
    extensions: [],
  };

  useEffect(() => {
    if (window !== undefined) {
      run(volume1.current, volume2.current);
      const runManagerInit = async () => {
        managerInit(defaultConfig, [], [])
          .then(setManagers)
          .catch(console.error);
      };

      runManagerInit();
    }
  }, []);

  return (
    <div id="volume" style={{ display: "flex", flexDirection: "row" }}>
      <div ref={volume1} style={{ width: 250, height: 250 }}></div>
      <div ref={volume2} style={{ width: 250, height: 250 }}></div>
    </div>
  );
}
