export const requestUserMedia = async (): Promise<MediaStream> => {
  try {
    const constraints = {
      audio: true,
      video: true, // CHANGE: Simplified constraints for broader compatibility
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    // CHANGE: Log stream details
    console.log("MediaStream acquired:", stream, stream.getTracks());
    stream.getTracks().forEach((track) => {
      console.log(`Track ${track.kind}: enabled=${track.enabled}, readyState=${track.readyState}`);
    });
    return stream;
  } catch (error) {
    console.error("Error accessing media devices:", error.message, error.stack); // CHANGE: Detailed error logging
    throw new Error(
      "Could not access camera or microphone. Please check permissions."
    );
  }
};

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  constructor() {
    this.recordedChunks = [];
  }

  initialize(stream: MediaStream): void {
    this.stream = stream;
    this.recordedChunks = [];

    console.log("Initializing VideoRecorder with stream:", stream, stream.getTracks());

    if (
      !stream
        .getTracks()
        .some((track) => track.enabled && track.readyState === "live")
    ) {
      throw new Error("No active tracks in stream");
    }

    try {
      const mimeTypes = [
        "video/webm;codecs=vp8,opus", // Prioritize for broad support
        "video/webm;codecs=vp9,opus",
        "video/webm",
      ];
      const supportedMimeType = mimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );
      if (!supportedMimeType) {
        throw new Error("No supported MIME type for MediaRecorder");
      }
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType,
      });
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          console.log("Data available, chunk size:", event.data.size, "Total chunks:", this.recordedChunks.length);
        } else {
          console.warn("Received empty or invalid data chunk");
        }
      };
      this.mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
      };
    } catch (error) {
      console.error("Error initializing MediaRecorder:", error.message, error.stack);
      throw error;
    }
  }

  async updateStream(newStream: MediaStream): Promise<void> {
    if (!this.mediaRecorder) {
      throw new Error("MediaRecorder not initialized");
    }

    console.log("Updating stream:", newStream, newStream.getTracks());

    if (
      !newStream
        .getTracks()
        .some((track) => track.enabled && track.readyState === "live")
    ) {
      throw new Error("No active tracks in new stream");
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    this.stream = newStream;

    if (this.mediaRecorder.state === "recording") {
      const previousChunks = [...this.recordedChunks];
      await new Promise<void>((resolve) => {
        this.mediaRecorder!.onstop = () => {
          this.mediaRecorder = new MediaRecorder(newStream, {
            mimeType: this.mediaRecorder!.mimeType,
          });
          this.mediaRecorder!.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              this.recordedChunks.push(event.data);
              console.log("Data available after update, chunk size:", event.data.size, "Total chunks:", this.recordedChunks.length);
            } else {
              console.warn("Received empty or invalid data chunk after update");
            }
          };
          this.recordedChunks = [...previousChunks];
          this.mediaRecorder!.start(1000);
          console.log("Recorder restarted with new stream");
          resolve();
        };
        this.mediaRecorder!.stop();
      });
    }
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  start(): void {
    try {
      if (!this.mediaRecorder) {
        throw new Error("MediaRecorder not initialized");
      }
      if (this.mediaRecorder.state === "recording") {
        console.warn("Recording already in progress");
        return;
      }
      if (
        !this.stream ||
        !this.stream
          .getTracks()
          .some((track) => track.enabled && track.readyState === "live")
      ) {
        throw new Error("No active tracks in stream");
      }
      this.mediaRecorder.start(1000);
      console.log("Recording started, state:", this.mediaRecorder.state);
    } catch (error) {
      console.error("Error starting recording:", error.message, error.stack);
      throw error;
    }
  }

  async stop(): Promise<Blob | null> {
    if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
      console.warn("Recorder is inactive or not initialized");
      return null;
    }
    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        // Add a slight delay to ensure all chunks are collected
        setTimeout(() => {
          try {
            console.log("Stopping recorder, recorded chunks:", this.recordedChunks.length);
            const blob = this.createVideoBlob();
            this.recordedChunks = [];
            console.log(
              "Recording stopped, blob:",
              blob ? `size=${blob.size}, type=${blob.type}` : "null"
            );
            resolve(blob);
          } catch (error) {
            console.error("Error creating Blob:", error.message, error.stack);
            reject(error);
          }
        }, 1000); // Increased delay to 1000ms to ensure chunk collection
      };
      this.mediaRecorder!.onerror = (event) => {
        console.error("Stop error:", event);
        reject(new Error("MediaRecorder encountered an error"));
      };
      try {
        this.mediaRecorder!.stop();
        console.log("Stopping recorder, state:", this.mediaRecorder!.state);
      } catch (error) {
        console.error("Error stopping recorder:", error.message, error.stack);
        reject(error);
      }
    });
  }

  getRecordedChunks(): Blob[] {
    return this.recordedChunks;
  }

  private createVideoBlob(): Blob | null {
    if (this.recordedChunks.length === 0) {
      console.warn("No recorded chunks available");
      return null;
    }
    const mimeType = this.mediaRecorder?.mimeType || "video/webm";
    try {
      const blob = new Blob(this.recordedChunks, { type: mimeType });
      console.log("Created video blob:", `size=${blob.size}, type=${blob.type}`);
      return blob;
    } catch (error) {
      console.error("Error creating video blob:", error.message, error.stack);
      return null;
    }
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }
}

export class SpeechRecognitionUtil {
  private recognition: any = null;
  private isListening: boolean = false;
  private transcript: string = "";
  private onResultCallback: ((result: string) => void) | null = null;

  constructor() {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionAPI();
      this.setupRecognition();
    } else {
      console.error("Speech recognition not supported in this browser");
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }

      this.transcript = currentTranscript;

      if (this.onResultCallback) {
        this.onResultCallback(this.transcript);
      }

      this.stop();
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error); // CHANGE: Detailed error logging
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  start() {
    if (!this.recognition) {
      console.error("Speech recognition not supported");
      return;
    }

    if (this.isListening) {
      console.warn("Speech recognition already active");
      return;
    }

    try {
      this.isListening = true;
      this.transcript = "";
      this.recognition.start();
    } catch (e) {
      console.error("Error starting speech recognition:", e.message, e.stack); // CHANGE: Detailed error logging
      this.isListening = false;
    }
  }

  stop() {
    if (!this.recognition) return;

    this.isListening = false;
    this.recognition.stop();
  }

  getTranscript(): string {
    return this.transcript;
  }

  resetTranscript() {
    this.transcript = "";
  }

  onResult(callback: (result: string) => void) {
    this.onResultCallback = callback;
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  isActive(): boolean {
    return this.isListening;
  }
}