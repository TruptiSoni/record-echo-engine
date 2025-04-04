
import React, { useState, useRef } from 'react';
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

  const startRecording = async () => {
    recordedChunksRef.current = [];
    setRecordedVideoUrl(null);
    try {
      // Create proper type-safe options for Chrome's implementation
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: true, // Start with standard video constraints
        audio: false
      };
      
      // Chrome-specific cursor option needs to be added this way to avoid TypeScript errors
      const chromeMediaOptions = {
        video: {
          cursor: "always"
        },
        audio: false
      };
      
      // Use Chrome-specific options but with type assertion
      const screenStream = await navigator.mediaDevices.getDisplayMedia(chromeMediaOptions as DisplayMediaStreamOptions);
      
      let combinedStream = screenStream;
      
      // Add audio track if microphone is enabled
      if (isMicEnabled) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTracks = audioStream.getAudioTracks();
        audioTracks.forEach(track => {
          screenStream.addTrack(track);
        });
      }
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(screenStream, { mimeType: 'video/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
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
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Your screen is now being recorded."
      });
      
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
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const downloadRecording = () => {
    if (recordedVideoUrl) {
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
        setRecordedVideoUrl(null);
      }, 100);
      
      toast({
        title: "Download started",
        description: "Your screen recording is downloading."
      });
    }
  };
  
  const toggleMic = () => {
    setIsMicEnabled(!isMicEnabled);
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
