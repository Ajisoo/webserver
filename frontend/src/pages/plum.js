import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import api from "../util";

class ApiLoader extends Hls.DefaultConfig.loader {
  load(context, config, callbacks) {
    const fullUrl = context.url;
    const url = new URL(fullUrl);
    const path = url.pathname + url.search;

    const stats = {
      trequest: performance.now(),
      tfirst: 0,
      tload: 0,
      loaded: 0,
      total: 0,
    };

    api(path, { method: "GET" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${path}, status ${response.status}`);
        }

        let data;

        // 👇 IMPORTANT: manifest must be text
        if (path.endsWith(".m3u8")) {
          data = await response.text();
          stats.loaded = stats.total = data.length;
        } else {
          data = await response.arrayBuffer();
          stats.loaded = stats.total = data.byteLength;
        }

        stats.tfirst = stats.tload = performance.now();

        callbacks.onSuccess({ data }, stats, context);
      })
      .catch((err) => {
        callbacks.onError(
          { code: 0, text: err.message },
          context,
          null
        );
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
    const streamUrl = `/stream/stream.m3u8`;

    hls.loadSource(streamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS error:", data);
    });

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