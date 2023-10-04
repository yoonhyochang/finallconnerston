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
  BrushTool,
  SegmentationDisplayTool,
  segmentation,
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
async function run(element1, element2, element3) {
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

      addTool(SegmentationDisplayTool);
      addTool(BrushTool);
    
  const volumeName = "CT_VOLUME_ID";
  const toolGroupId = "CT_TOOLGROUP";
  const volumeLoaderScheme = "cornerstoneStreamingImageVolume";
  const volumeId = `${volumeLoaderScheme}:${volumeName}`;
  const segmentationId = "MY_SEGMENTATION_ID";

  // 세분화 표시 도구를 추가할 도구 그룹을 정의
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

  // Segmentation Tools(세분화 도구)
  toolGroup.addTool(SegmentationDisplayTool.toolName);
  toolGroup.addTool(BrushTool.toolName);
  toolGroup.setToolEnabled(SegmentationDisplayTool.toolName);

  toolGroup.setToolActive(BrushTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
  });

  // Define a volume in memory for CT(메모리에서 CT용 볼륨 정의)
  const volume = await volumeLoader.createAndCacheVolume(volumeId, {
    imageIds,
  });

  // Create a segmentation of the same resolution as the source data for the CT volume
  //CT 볼륨의 소스 데이터와 동일한 해상도의 세그먼테이션을 생성
    await volumeLoader.createAndCacheDerivedVolume(volumeId, {
      volumeId: segmentationId,
    });

  // Add the segmentations to state(세그먼테이션 상태추가)
  segmentation.addSegmentations([
    {
      segmentationId,
      representation: {
        // The type of segmentation(세분화 유형)
        type: csToolsEnums.SegmentationRepresentations.Labelmap,
        //실제 세분화 데이터, 라벨맵의 경우 세분화의 소스 볼륨에 대한 참조
        data: {
          volumeId: segmentationId,
        },
      },
    },
  ]);

  // 렌더링 엔진과 뷰포트 설정
  const renderingEngineId = "myRenderingEngine";
  const renderingEngine = new RenderingEngine(renderingEngineId);

  const viewportId1 = "CT_AXIAL";
  const viewportId2 = "CT_SAGITTAL";
  const viewportId3 = "CT_CORONAL";

 const viewportInputArray = [
   {
     viewportId: viewportId1,
     type: ViewportType.ORTHOGRAPHIC,
     element: element1,
     defaultOptions: {
       orientation: Enums.OrientationAxis.AXIAL,
     },
   },
   {
     viewportId: viewportId2,
     type: ViewportType.ORTHOGRAPHIC,
     element: element2,
     defaultOptions: {
       orientation: Enums.OrientationAxis.SAGITTAL,
     },
   },
   {
     viewportId: viewportId3,
     type: ViewportType.ORTHOGRAPHIC,
     element: element3,
     defaultOptions: {
       orientation: Enums.OrientationAxis.CORONAL,
     },
   },
 ];

  // 렌더링 엔진 초기화 및 뷰포트 획득
  renderingEngine.setViewports(viewportInputArray);

  toolGroup.addViewport(viewportId1, renderingEngineId);
  toolGroup.addViewport(viewportId2, renderingEngineId);
  toolGroup.addViewport(viewportId3, renderingEngineId);

  // Set the volume to load
  volume.load();

  // Set volumes on the viewports
  await setVolumesForViewports(
    renderingEngine,
    [
      {
        volumeId,
      },
    ],
    [viewportId1, viewportId2, viewportId3]
  );

  // Add the segmentation representation to the toolGroup
  await segmentation.addSegmentationRepresentations(toolGroupId, [
    {
      segmentationId,
      type: csToolsEnums.SegmentationRepresentations.Labelmap,
    },
  ]);

  // Render the image
  renderingEngine.renderViewports([viewportId1, viewportId2, viewportId3]);
}

// 뷰포트 컴포넌트
export default function Viewport() {
  // 참조와 상태 설정
  const volume1 = useRef(null);
    const volume2 = useRef(null);
    const volume3 = useRef(null);
  const [managers, setManagers] = useState(null);
  const defaultConfig = {
    extensions: [],
  };

  // useEffect 안에서 별도의 async 함수를 선언
  useEffect(() => {
    const init = async () => {
        try {
      // await을 사용해 비동기 함수 호출
      await run(volume1.current, volume2.current, volume3.current);

      // 매니저 초기화
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
      <div ref={volume3} style={{ width: 250, height: 250 }}></div>
    </div>
  );
}
