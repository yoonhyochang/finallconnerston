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
  ZoomTool,
  Enums as csToolsEnums,
} from "@cornerstonejs/tools";
import {
  createImageIdsAndCacheMetaData,
  initCornerstone,
} from "../utils/cornerstone3D";
import managerInit from "./managerInit";

const { ViewportType } = Enums;

async function run(element) {
  await initCornerstone();

  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID:
      "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
    SeriesInstanceUID:
      "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
    wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
  });

  const renderingEngineId = "myRenderingEngine";
  const viewportId = "CT_AXIAL_STACK";
  const renderingEngine = new RenderingEngine(renderingEngineId);

  const viewportInput = {
    viewportId,
    element,
    type: ViewportType.STACK,
  };

  renderingEngine.enableElement(viewportInput);
  const viewport = renderingEngine.getViewport(viewportId);
  viewport.setStack(imageIds);
  viewport.render();

  const toolGroupId = "myToolGroup";
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

  toolGroup.addTool(ZoomTool.toolName);
  toolGroup.addTool(WindowLevelTool.toolName);

  toolGroup.addViewport(viewportId, renderingEngineId);

  toolGroup.setToolActive(WindowLevelTool.toolName, {
    bindings: [
      {
        mouseButton: csToolsEnums.MouseBindings.Primary,
      },
    ],
  });

  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [
      {
        mouseButton: csToolsEnums.MouseBindings.Secondary,
      },
    ],
  });
}

export default function Viewport() {
  const viewer = useRef(null);
  const [managers, setManagers] = useState(null);
  const defaultConfig = {
    extensions: [],
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      run(viewer.current);
      managerInit(defaultConfig, [], []).then(setManagers).catch(console.error);
    }
  }, []);

  return (
    <div
      id="content"
      style={{ width: "500px", height: "500px" }}
      ref={viewer}
    ></div>
  );
}
