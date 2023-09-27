// 필요한 모듈과 라이브러리를 임포트
import {
  RenderingEngine,
  Enums,
} from "@cornerstonejs/core";
import {
  addTool,
  ToolGroupManager,
  WindowLevelTool,
  ZoomTool,
  Enums as csToolsEnums,
} from "@cornerstonejs/tools";
import {
  createImageIdsAndCacheMetaData,
  initCornerstone,
} from "../utils/cornerstone3D";
import { useEffect, useRef, useState } from "react";
  

import managerInit from "./managerInit";

// 필요한 Enum 값을 디스트럭처링
const { ViewportType } = Enums;

// 주요 실행 함수
async function run() {
  // Init Cornerstone and related libraries
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

  const content = document.getElementById("content");

  const element = document.createElement("div");

  // Disable the default context menu
  element.oncontextmenu = (e) => e.preventDefault();
  element.style.width = "500px";
  element.style.height = "500px";

  content.appendChild(element);

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

  const viewport = renderingEngine.getViewport(viewportId);

  viewport.setStack(imageIds);

  viewport.render();



  const toolGroupId = "myToolGroup";
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

  // Add tools to the ToolGroup
  toolGroup.addTool(ZoomTool.toolName);
  toolGroup.addTool(WindowLevelTool.toolName);

  toolGroup.addViewport(viewportId, renderingEngineId);

  // Set the windowLevel tool to be active when the mouse left button is pressed
  toolGroup.setToolActive(WindowLevelTool.toolName, {
    bindings: [
      {
        mouseButton: csToolsEnums.MouseBindings.Primary, // Left Click
      },
    ],
  });

  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [
      {
        mouseButton: csToolsEnums.MouseBindings.Secondary, // Right Click
      },
    ],
  });
    
}

// 뷰포트 컴포넌트
export default function Viewport() {
  // 참조와 상태 설정
  const viewer = useRef(null);
  const [managers, setManagers] = useState(null);
  const defaultConfig = {
    extensions: [],
  };

  // useEffect 안에서 별도의 async 함수를 선언
  useEffect(() => {
    const init = async () => {
      // await을 사용해 비동기 함수 호출
      await run(viewer.current);

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

  return <div ref={viewer}>{/* 뷰포트에 표시될 내용 */}</div>;
}
