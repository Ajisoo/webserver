import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import api from "../util";

class ApiLoader extends Hls.DefaultConfig.loader {
  load(context, config, callbacks) {
    const url = context.url;

    api(url, { method: "GET" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Failed to fetch ${url}, status ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        // feed hls.js
        callbacks.onSuccess({ data: arrayBuffer }, 0, 0);
      })
      .catch((err) => {
        callbacks.onError({ code: 0, text: err.message }, context, null);
      });
  }
}

export default function Plum() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hls = new Hls({
      loader: ApiLoader,       // use custom loader
      enableWorker: true,
      liveSyncDurationCount: 3, // low-latency live stream
      maxBufferLength: 30,      // keep ~30s of segments in memory
    });

    // HLS playlist URL served by your Spring backend
    const streamUrl = `${process.env.REACT_APP_API_HOST}/stream/stream.m3u8`;

    hls.loadSource(streamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch((err) => console.error("Video play failed:", err));
    });

    // Clean up on unmount
    return () => {
      hls.destroy();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      style={{ width: "100%", maxWidth: 640 }}
    />
  );
}