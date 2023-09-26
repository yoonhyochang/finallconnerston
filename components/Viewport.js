// 필요한 모듈과 라이브러리를 임포트
import {
    RenderingEngine,
    Enums,
} from '@cornerstonejs/core';
import {
    createImageIdsAndCacheMetaData,
    initCornerstone,
} from '../utils/cornerstone3D';
import { useEffect, useRef, useState } from 'react';


import managerInit from './managerInit';

// 필요한 Enum 값을 디스트럭처링
const { ViewportType } = Enums;

// 주요 실행 함수
async function run(element) {

  // Init Cornerstone and related libraries
  // Cornerstone 및 관련 라이브러리 초기화
  await initCornerstone();

  // Get Cornerstone imageIds and fetch metadata into RAM
  // Cornerstone 이미지 ID 및 메타데이터 획득
  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID: "1.400.20.81.610.201712061281",
    SeriesInstanceUID: "1.3.46.670589.30.1.6.1.1625523293.1512518914734.3",
    wadoRsRoot: "http://localhost/orthanc/dicom-web",
  });

  // 렌더링 엔진과 뷰포트 설정
  const renderingEngineId = "myRenderingEngine";
  const viewportId = "CT_AXIAL_STACK";
  const renderingEngine = new RenderingEngine(renderingEngineId);

  const viewportInput = {
    viewportId,
    element,
    type: ViewportType.STACK,
  };

  // 렌더링 엔진 초기화 및 뷰포트 획득
  renderingEngine.enableElement(viewportInput);
  const viewport = renderingEngine.getViewport(viewportInput.viewportId);

  viewport.setStack(imageIds, imageIds.length - 1);
  viewport.render();
}

// 뷰포트 컴포넌트
export default function Viewport() {
  // 참조와 상태 설정
  const viewer = useRef(null);
  const [managers, setManagers] = useState(null);
  const defaultConfig = {
    extensions: [],
  };

  useEffect(() => {
      if (window !== undefined) {
        // 초기화 및 매니저 설정
        run(viewer.current);
        const runManagerInit = async () => {
          managerInit(defaultConfig, [], [])
            .then(setManagers)
            .catch(console.error);
        };

        runManagerInit();
      }
  }, []);

  return (
    <div
      id="cornerstone-element"
      ref={viewer}
      style={{ width: 500, height: 1024 }}
    >

    </div>
  );
}
