// 필요한 모듈과 라이브러리를 임포트
import React, { useEffect, useRef, useState } from "react";
import {
  RenderingEngine,
  Enums,
  setVolumesForViewports,
  volumeLoader,
} from "@cornerstonejs/core";
import {
  BidirectionalTool,
  ToolGroupManager,
  Enums as csToolsEnums,
} from "@cornerstonejs/tools";
import {
  createImageIdsAndCacheMetaData,
  initCornerstone,
} from "../utils/cornerstone3D";

// 필요한 Enum 값을 디스트럭처링
const { ViewportType } = Enums;

export default function ViewportComponent() {
  const element1 = useRef(null);
  const element2 = useRef(null);

  useEffect(() => {
    const run = async () => {
      // Initialize Cornerstone and other libraries
      await initCornerstone();

      // Fetch Cornerstone imageIds and cache metadata
      const imageIds = await createImageIdsAndCacheMetaData({
        StudyInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
        SeriesInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
        wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
      });

      // Create a volume in memory
      const volumeId = `${volumeLoaderScheme}:${volumeName}`; // VolumeId with loader id + volume id
      const volume = await volumeLoader.createAndCacheVolume(volumeId, {
        imageIds,
      });

      // Initialize rendering engine
      const renderingEngineId = "myRenderingEngine";
      const renderingEngine = new RenderingEngine(renderingEngineId);

      // Define the viewport configuration
      const viewportInput = [
        {
          viewportId: "CT_AXIAL",
          element: element1.current,
          type: ViewportType.ORTHOGRAPHIC,
          defaultOptions: {
            orientation: Enums.OrientationAxis.AXIAL,
          },
        },
        {
          viewportId: "CT_SAGITTAL",
          element: element2.current,
          type: ViewportType.ORTHOGRAPHIC,
          defaultOptions: {
            orientation: Enums.OrientationAxis.SAGITTAL,
          },
        },
      ];

      renderingEngine.setViewports(viewportInput);

      // Add tools
      addTool(BidirectionalTool);

      const toolGroupId = "myToolGroup";
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      toolGroup.addTool(BidirectionalTool.toolName);

      toolGroup.addViewport("CT_AXIAL", renderingEngineId);
      toolGroup.addViewport("CT_SAGITTAL", renderingEngineId);

      // ... any other configurations or tool settings

      // Load the volume and render the viewports
      volume.load();
      setVolumesForViewports(
        renderingEngine,
        [{ volumeId }],
        ["CT_AXIAL", "CT_SAGITTAL"]
      );
      renderingEngine.renderViewports(["CT_AXIAL", "CT_SAGITTAL"]);
    };

    run().catch((err) => console.error(err));
  }, []);

  return (
    <div id="content">
      <div ref={element1} style={{ width: "250px", height: "250px" }}></div>
      <div ref={element2} style={{ width: "250px", height: "250px" }}></div>
    </div>
  );
}