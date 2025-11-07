import { useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export const useExportVisualization = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async (elementId: string, filename: string = "visualization.png") => {
    setIsExporting(true);
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        toast.error("Visualization element not found");
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Image exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export image");
    } finally {
      setIsExporting(false);
    }
  };

  const startVideoRecording = (elementId: string): MediaRecorder | null => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        toast.error("Visualization element not found");
        return null;
      }

      // @ts-ignore - captureStream is not in TypeScript types yet
      const stream = element.captureStream ? element.captureStream(30) : null;
      
      if (!stream) {
        toast.error("Video recording not supported in this browser");
        return null;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "visualization.webm";
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Video exported successfully!");
      };

      mediaRecorder.start();
      toast.info("Recording started...");
      
      return mediaRecorder;
    } catch (error) {
      console.error("Recording failed:", error);
      toast.error("Failed to start recording");
      return null;
    }
  };

  const exportAsGIF = async (elementId: string, duration: number = 5000) => {
    setIsExporting(true);
    toast.info("Capturing frames for GIF...");

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        toast.error("Visualization element not found");
        return;
      }

      // Dynamic import for gif.js
      const GIF = (await import("gif.js")).default;
      
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      const frameCount = 30;
      const frameDelay = duration / frameCount;

      for (let i = 0; i < frameCount; i++) {
        const canvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 1,
        });
        
        gif.addFrame(canvas, { delay: frameDelay });
        
        await new Promise(resolve => setTimeout(resolve, frameDelay));
      }

      gif.on("finished", (blob: Blob) => {
        const link = document.createElement("a");
        link.download = "visualization.gif";
        link.href = URL.createObjectURL(blob);
        link.click();
        toast.success("GIF exported successfully!");
        setIsExporting(false);
      });

      gif.render();
    } catch (error) {
      console.error("GIF export failed:", error);
      toast.error("Failed to export GIF");
      setIsExporting(false);
    }
  };

  return {
    exportAsImage,
    startVideoRecording,
    exportAsGIF,
    isExporting,
  };
};
