import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { FaVideoSlash } from 'react-icons/fa';

export interface CameraFeedHandle {
  captureFrame: () => string | null;
}

const CameraFeed = forwardRef<CameraFeedHandle, {}>((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStream(stream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied or not available.");
      }
    };

    enableCamera();

    return () => {
      // Cleanup: stop the stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          return canvas.toDataURL('image/jpeg');
        }
      }
      return null;
    }
  }));

  return (
    <div className="bg-black rounded-lg aspect-video w-full flex items-center justify-center overflow-hidden relative">
      {error ? (
        <div className="text-center text-red-400">
          <FaVideoSlash className="text-4xl mx-auto mb-2" />
          <p>{error}</p>
        </div>
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
});

export default CameraFeed;