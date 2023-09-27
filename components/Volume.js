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

const { ViewportType } = Enums;

async function run(element1, element2) {
  await initCornerstone();

  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID:
      "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
    SeriesInstanceUID:
      "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
    wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
  });

  const volumeName = "PROSTATE_VOLUME";
  const volumeLoaderScheme = "cornerstoneStreamingImageVolume";
  const volumeId = `${volumeLoaderScheme}:${volumeName}`;

  const volume = await volumeLoader.createAndCacheVolume(volumeId, {
    imageIds,
  });

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

  volume.load();

  setVolumesForViewports(
    renderingEngine,
    [{ volumeId }],
    [viewportId1, viewportId2]
  );
  renderingEngine.renderViewports([viewportId1, viewportId2]);
}

export default function Viewport() {
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
    <div id="content" style={{ display: "flex", flexDirection: "row" }}>
      <div ref={volume1} style={{ width: 500, height: 500 }}></div>
      <div ref={volume2} style={{ width: 500, height: 500 }}></div>
    </div>
  );
}
