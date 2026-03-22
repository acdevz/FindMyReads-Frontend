import React, { useRef, useState, useEffect } from "react";

export default function CameraOverlay({ onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [hasPhoto, setHasPhoto] = useState(false);
  const [stream, setStream] = useState(null);

  // Initialize Camera
  useEffect(() => {
    let isMounted = true;
    let localStream = null; // Local reference to the stream

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Prefer rear camera
        });

        if (!isMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error accessing camera:", err);
          alert("Camera access is required to scan books.");
          if (onClose) onClose();
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null; // Clear the source
      }
    };
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    // Set canvas dimensions to match video source
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setHasPhoto(true);
  };

  const retakePhoto = () => {
    setHasPhoto(false);
  };

  const confirmPhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to a Blob/File for the multipart form data [cite: 165, 166]
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "shelf-scan.jpg", {
            type: "image/jpeg",
          });
          onCapture(file);
        }
      },
      "image/jpeg",
      0.8,
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col justify-center items-center font-body text-surface">
      {/* Viewfinder Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-surface-container-highest/20 text-surface hover:bg-surface-container-highest/40 backdrop-blur-md transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <span className="font-label uppercase tracking-widest text-xs font-bold">
          Align Shelf in Frame
        </span>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Camera Feed / Captured Image Wrapper */}
      <div className="relative w-full max-w-md aspect-[3/4] overflow-hidden bg-stone-900 rounded-2xl mx-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${hasPhoto ? "hidden" : "block"}`}
        ></video>

        <canvas
          ref={canvasRef}
          className={`w-full h-full object-cover ${hasPhoto ? "block" : "hidden"}`}
        ></canvas>

        {/* Viewfinder Borders (Visible only when taking photo) */}
        {!hasPhoto && (
          <div className="absolute inset-8 border-2 border-primary/40 rounded-xl overflow-hidden pointer-events-none shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>

            {/* Animated Scan Line */}
            <div className="absolute w-full h-[2px] bg-primary/80 blur-[1px] shadow-[0_0_8px_var(--color-primary)] animate-[scan_3s_ease-in-out_infinite_alternate]"></div>
            <style>
              {`@keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }`}
            </style>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full p-8 pb-12 flex justify-center items-center gap-8 bg-gradient-to-t from-black via-black/80 to-transparent">
        {!hasPhoto ? (
          <button
            onClick={takePhoto}
            className="w-20 h-20 rounded-full border-4 border-surface p-1 hover:scale-105 active:scale-95 transition-all"
          >
            <div className="w-full h-full bg-primary rounded-full"></div>
          </button>
        ) : (
          <div className="flex gap-6 w-full max-w-sm px-4">
            <button
              onClick={retakePhoto}
              className="flex-1 py-4 rounded-xl font-label text-sm font-bold tracking-widest uppercase bg-surface-container-highest/20 text-surface backdrop-blur-md hover:bg-surface-container-highest/40 transition-colors"
            >
              Retake
            </button>
            <button
              onClick={confirmPhoto}
              className="flex-1 py-4 rounded-xl font-label text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-lg hover:shadow-xl transition-all"
            >
              Use Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
