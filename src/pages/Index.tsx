import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Mic, MicOff, Video, VideoOff, Download } from 'lucide-react';

export default function Index() {
  const [isRecording, setIsRecording] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Check for Chrome extension environment
  useEffect(() => {
    // Log that the popup has loaded
    console.log("Screen Recorder popup loaded");

    // Clean up any stale recording state
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        const tracks = mediaRecorderRef.current.stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    recordedChunksRef.current = [];
    setRecordedVideoUrl(null);
    try {
      // Create proper type-safe options for Chrome's implementation
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: true,
        audio: false
      };
      
      // Request screen capture
      console.log("Requesting screen capture...");
      const screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      
      let combinedStream = screenStream;
      
      // Add audio track if microphone is enabled
      if (isMicEnabled) {
        console.log("Requesting microphone access...");
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTracks = audioStream.getAudioTracks();
        audioTracks.forEach(track => {
          screenStream.addTrack(track);
        });
        console.log("Microphone added to stream");
      }
      
      // Create MediaRecorder with browser-compatible settings
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      console.log("Setting up MediaRecorder");
      
      // Try the preferred codec, but fall back to a more compatible one if needed
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(screenStream, options);
      } catch (e) {
        console.warn("VP9/opus not supported, trying alternative codec");
        mediaRecorder = new MediaRecorder(screenStream, { mimeType: 'video/webm' });
      }
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log("Recording stopped, processing video...");
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        
        // Stop all tracks
        screenStream.getTracks().forEach(track => track.stop());
        
        toast({
          title: "Recording saved",
          description: "Your screen recording is ready to download."
        });
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms for more frequent chunks
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Your screen is now being recorded."
      });
      
      console.log("Recording started successfully");
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: "Failed to start recording. Please try again."
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const downloadRecording = () => {
    if (recordedVideoUrl) {
      console.log("Downloading recording...");
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = recordedVideoUrl;
      a.download = `screen-recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(recordedVideoUrl);
      }, 100);
      
      toast({
        title: "Download started",
        description: "Your screen recording is downloading."
      });
    }
  };
  
  const toggleMic = () => {
    setIsMicEnabled(!isMicEnabled);
    console.log("Microphone", !isMicEnabled ? "enabled" : "disabled");
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-center">Screen Recorder</h1>
        
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {isRecording 
              ? "Recording in progress..." 
              : recordedVideoUrl
                ? "Recording complete. Download or start a new recording."
                : "Click the button below to start recording your screen with audio."}
          </p>
        </div>
        
        <div className="flex justify-center mb-6 space-x-4">
          {isRecording ? (
            <Button 
              variant="destructive" 
              onClick={stopRecording}
              className="px-6"
            >
              <VideoOff className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          ) : recordedVideoUrl ? (
            <>
              <Button 
                onClick={downloadRecording}
                className="px-6"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Recording
              </Button>
              <Button 
                variant="outline"
                onClick={() => setRecordedVideoUrl(null)}
                className="px-6"
              >
                Start New
              </Button>
            </>
          ) : (
            <Button 
              onClick={startRecording}
              className="px-6"
            >
              <Video className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          )}
        </div>
        
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={toggleMic}
            className={isMicEnabled ? "bg-green-100" : ""}
          >
            {isMicEnabled ? (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Mic Enabled
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Mic Disabled
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
