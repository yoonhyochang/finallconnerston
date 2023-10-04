// 필요한 모듈과 라이브러리를 임포트
import React, { useEffect, useRef, useState } from "react";
import {
  RenderingEngine,
  Enums,
  setVolumesForViewports,
  volumeLoader,
} from "@cornerstonejs/core";
import {
  addTool,
  ToolGroupManager,
  WindowLevelTool,
  BidirectionalTool,
  Enums as csToolsEnums,
} from "@cornerstonejs/tools";
import {
  createImageIdsAndCacheMetaData,
  initCornerstone,
} from "../utils/cornerstone3D";
import managerInit from "./managerInit";

// 필요한 Enum 값을 디스트럭처링
const { ViewportType } = Enums;

// 주요 실행 함수
async function run(element1, element2) {
  // Cornerstone 및 관련 라이브러리 초기화
  await initCornerstone();

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

  // 렌더링 엔진 초기화 및 뷰포트 획득
  renderingEngine.setViewports(viewportInput);

  // Set the volume to load
  volume.load();

  setVolumesForViewports(
    renderingEngine,
    [
      {
        volumeId,
        callback: ({ volumeActor }) => {
          // set the windowLevel after the volumeActor is created
          volumeActor
            .getProperty()
            .getRGBTransferFunction(0)
            .setMappingRange(-180, 220);
        },
      },
    ],
    [viewportId1, viewportId2]
  );

  renderingEngine.renderViewports([viewportId1, viewportId2]);

  const toolGroupId = "myToolGroup";
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

  // Add tools to the ToolGroup
  toolGroup.addTool(BidirectionalTool.toolName);

  toolGroup.addViewport(viewportId1, renderingEngineId);
  toolGroup.addViewport(viewportId2, renderingEngineId);

  // Set the
  toolGroup.setToolActive(BidirectionalTool.toolName, {
    bindings: [
      {
        mouseButton: csToolsEnums.MouseBindings.Primary, // Left Click
      },
    ],
  });



  // Render the image
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

  // useEffect 안에서 별도의 async 함수를 선언
  useEffect(() => {
    const init = async () => {
      // await을 사용해 비동기 함수 호출
      await run(volume1.current, volume2.current);

      // 매니저 초기화
      try {
        const managerConfig = await managerInit(defaultConfig, [], []);
        setManagers(managerConfig);
      } catch (error) {
        console.error(error);
      }
    };

    // window 객체가 정의되어 있다면 init 함수 호출
    if (typeof window !== "undefined") {
      init();
    }
  }, []);

  return (
    <div id="volume" style={{ display: "flex", flexDirection: "row" }}>
      <div ref={volume1} style={{ width: 250, height: 250 }}></div>
      <div ref={volume2} style={{ width: 250, height: 250 }}></div>
    </div>
  );
}
