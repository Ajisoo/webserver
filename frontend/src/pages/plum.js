import { useEffect, useRef } from "react";
import Hls from "hls.js";
import api from "./api";

class ApiLoader {
  constructor(config) {
    this.config = config;
    this.context = null;
    this.callbacks = null;
  }

  load(context, config, callbacks) {
    this.context = context;
    this.context.url = this.context.url.replace(`${process.env.REACT_APP_API_HOST}`, "")
    this.callbacks = callbacks;

    const stats = {
      trequest: performance.now(),
      tfirst: 0,
      tload: 0,
      loaded: 0,
      total: 0,
    };

    api(context.url, { method: "GET" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

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
            url: context.url,
          },
          stats,
          context
        );
      })
      .catch((error) => {
        callbacks.onError(
          {
            code: 0,
            text: error.message,
          },
          context,
          null
        );
      });
  }

  abort() {}
  destroy() {}
}

export default function LiveStream() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hls = new Hls({
      loader: ApiLoader,
      enableWorker: true,
      liveSyncDurationCount: 3,
    });

    const streamUrl = `${process.env.REACT_APP_API_HOST}/stream/stream.m3u8`;

    hls.loadSource(streamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS error:", data);
    });

    return () => {
      hls.destroy();
    };
  }, []);

  return <video ref={videoRef} controls autoPlay style={{ width: "100%" }} />;
}