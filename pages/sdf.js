function cornerstoneStreamingImageVolumeLoader(
  volumeId: string,
  options: {
    imageIds: Array<string>,
  }
) {
  // Compute Volume metadata based on imageIds
  const volumeMetadata = makeVolumeMetadata(imageIds);
  const streamingImageVolume = new StreamingImageVolume(
    // ImageVolume properties
    {
      volumeId,
      metadata: volumeMetadata,
      dimensions,
      spacing,
      origin,
      direction,
      scalarData,
      sizeInBytes,
    },
    // Streaming properties
    {
      imageIds: sortedImageIds,
      loadStatus: {
        loaded: false,
        loading: false,
        cachedFrames: [],
        callbacks: [],
      },
    }
  );

  return {
    promise: Promise.resolve(streamingImageVolume),
    cancel: () => {
      streamingImageVolume.cancelLoading();
    },
  };
}

registerVolumeLoader(
  "cornerstoneStreamingImageVolume",
  cornerstoneStreamingImageVolumeLoader
);

// Used for any volume that its scheme is not provided
registerUnknownVolumeLoader(cornerstoneStreamingImageVolumeLoader);
