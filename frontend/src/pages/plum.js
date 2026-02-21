import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import api from "../util"; // your token-refreshing helper

class ApiLoader {
  constructor(config) {
    this.config = config;
    this.abortController = null;
  }

  load(context, config, callbacks) {
    this.abortController = new AbortController();

    const stats = {
      trequest: performance.now(),
      tfirst: 0,
      tload: 0,
      loaded: 0,
      total: 0,
    };

    api(context.url, {
      method: "GET",
      signal: this.abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data =
          context.responseType === "arraybuffer"
            ? await response.arrayBuffer()
            : await response.text();

        stats.tfirst = performance.now();
        stats.tload = performance.now();
        stats.loaded = data.byteLength || data.length;
        stats.total = stats.loaded;

        callbacks.onSuccess(
          {
            data,
            url: response.url,
          },
          stats,
          context,
          response // 👈 IMPORTANT: networkDetails must NOT be null
        );
      })
      .catch((err) => {
        callbacks.onError(
          {
            code: err.status || 0,
            text: err.message,
          },
          context,
          null
        );
      });
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  destroy() {}
}

// ----------------------
// React Component
// ----------------------
export default function LiveStream() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hls = new Hls({
      loader: ApiLoader,      // custom loader using your api()
      enableWorker: true,
      liveSyncDurationCount: 3, // low-latency live
      maxBufferLength: 30,
    });

    // Stream URL served by Spring backend
    const streamUrl = "/stream/stream.m3u8"; // relative path; api() will add host + "/api"

    hls.loadSource(streamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(console.error);
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS error:", data);
    });

    return () => {
      hls.destroy();
    };
  }, []);

  return <video ref={videoRef} controls autoPlay style={{ width: "100%" }} />;
}