import type { SessionType } from "@/app/interview/interview_dashboard/page";
import app, { database, storage, isFirebaseConfigured } from "@/firebase/config.js";
import { getDatabase, ref as dbRef, set, get, child, query, orderByChild } from "firebase/database"; // CHANGE: Realtime Database imports
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

// CHANGE: Initialize Realtime Database
const db = getDatabase(app);
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
console.log("⚠️ Using Firebase?", isFirebaseConfigured, "Storage:", !!storage,"suman");

if (isLocalhost && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  try {
    const { connectDatabaseEmulator } = require("firebase/database");
    connectDatabaseEmulator(db, "localhost", 9000);
    console.log("Connected to Realtime Database emulator at localhost:9000");
  } catch (error) {
    console.error("Failed to connect to Realtime Database emulator:", error.message, error.stack);
    toast({
      title: "Emulator Connection Failed",
      description: "Realtime Database emulator is not running. Falling back to local storage.",
      variant: "destructive",
    });
  }
}

export interface StoredSession extends Omit<SessionType, 'recording'> {
  recordingUrl?: string;
  jobDescription?: string;
  timestamp: number;
}

export const storeRecording = async (sessionId: string, recordingBlobs: Blob[]): Promise<string> => {
  try {
    if (!recordingBlobs.length) throw new Error("No recording data provided");
    const videoBlob = new Blob(recordingBlobs, { type: "video/webm" });

    if (!isFirebaseConfigured || !storage) {
      console.log("Firebase not configured, using object URL for video storage");
      return URL.createObjectURL(videoBlob);
    }

    const uploadToStorage = async (): Promise<string> => {
      const storagePath = storageRef(storage, `recordings/${sessionId}.webm`);
      console.log(`Uploading recording for session ${sessionId} to ${storagePath.fullPath}`);
      await uploadBytes(storagePath, videoBlob);
      const downloadURL = await getDownloadURL(storagePath);
      console.log(`Recording uploaded, download URL: ${downloadURL}`);
      return downloadURL;
    };

    if (isLocalhost) {
      try {
        const result = await Promise.race([
          uploadToStorage(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timeout - possible CORS issue")), 5000))
        ]);
        return result as string;
      } catch (err) {
        console.error("Local Firebase Storage error (likely CORS):", err.message);
        toast({
          title: "Local Development",
          description: "Using local video URL due to CORS limitations.",
        });
        return URL.createObjectURL(videoBlob); 
      }
    }
    

    const downloadURL = await uploadToStorage();
    console.log(`Recording stored for session ${sessionId}`);
    return downloadURL;
  } catch (error) {
    console.error("Error storing recording:", error.message, error.stack);
    toast({
      title: "Recording Saved Locally",
      description: "Your recording is available for this session only."
    });
    return URL.createObjectURL(new Blob(recordingBlobs, { type: "video/webm" }));
  }
};

export const saveSession = async (session: Omit<StoredSession, 'timestamp'>): Promise<void> => {
  try {
    const timestamp = Date.now();
    const sessionId = session.sessionId || uuidv4();
    const sessionData = { ...session, sessionId, timestamp };
    
    console.log(`Saving session ${sessionId} with data:`, JSON.stringify(sessionData, null, 2));

    if (!isFirebaseConfigured || !db) {
      const localSessions = JSON.parse(localStorage.getItem('interviewSessions') || '{}');
      localSessions[sessionId] = sessionData;
      localStorage.setItem('interviewSessions', JSON.stringify(localSessions));
      console.log(`Session ${sessionId} saved locally`);
      return;
    }

    const sessionRef = dbRef(db, `candidates/${sessionId}`);
    await set(sessionRef, sessionData);
    console.log(`Session ${sessionId} saved to Realtime Database under candidates`);
  } catch (error) {
    console.error("Error saving session:", error.message, error.stack);
    const timestamp = Date.now();
    const sessionId = session.sessionId || uuidv4();
    const localSessions = JSON.parse(localStorage.getItem('interviewSessions') || '{}');
    localSessions[sessionId] = { ...session, sessionId, timestamp };
    localStorage.setItem('interviewSessions', JSON.stringify(localSessions));
    console.log(`Session ${sessionId} saved locally`);
  }
};

export const saveSessionWithRecording = async (session: Omit<StoredSession, 'timestamp' | 'recordingUrl'>, recordingBlobs: Blob[]): Promise<void> => {
  try {
    const sessionId = session.sessionId || uuidv4();
    const recordingUrl = await storeRecording(sessionId, recordingBlobs);
    
    const timestamp = Date.now();
    const sessionData = { ...session, sessionId, recordingUrl, timestamp };
    
    console.log(`Saving session ${sessionId} with recording URL: ${recordingUrl}`);
    
    if (!isFirebaseConfigured || !db) {
      const localSessions = JSON.parse(localStorage.getItem('interviewSessions') || '{}');
      localSessions[sessionId] = sessionData;
      localStorage.setItem('interviewSessions', JSON.stringify(localSessions));
      console.log(`Session ${sessionId} with recording saved locally`);
      return;
    }

    const sessionRef = dbRef(db, `candidates/${sessionId}`);
    await set(sessionRef, sessionData);
    console.log(`Session ${sessionId} with recording saved to Realtime Database under candidates`);
  } catch (error) {
    console.error("Error saving session with recording:", error.message, error.stack);
    toast({
      title: "Session Save Failed",
      description: "Session saved locally due to an error.",
      variant: "destructive"
    });
    const timestamp = Date.now();
    const sessionId = session.sessionId || uuidv4();
    const localSessions = JSON.parse(localStorage.getItem('interviewSessions') || '{}');
    localSessions[sessionId] = { ...session, sessionId, timestamp };
    localStorage.setItem('interviewSessions', JSON.stringify(localSessions));
    console.log(`Session ${sessionId} saved locally`);
  }
};

export const getSession = async (sessionId: string): Promise<StoredSession | null> => {
  try {
    if (!isFirebaseConfigured || !db) {
      const localSessions = JSON.parse(localStorage.getItem('interviewSessions') || '{}');
      return localSessions[sessionId] || null;
    }
    
    const sessionRef = dbRef(db);
    const snapshot = await get(child(sessionRef, `candidates/${sessionId}`));
    return snapshot.exists() ? snapshot.val() as StoredSession : null;
  } catch (error) {
    console.error("Error getting session:", error.message, error.stack);
    const localSessions = JSON.parse(localStorage.getItem('interviewSessions') || '{}');
    return localSessions[sessionId] || null;
  }
};

export const getAllSessions = async (): Promise<StoredSession[]> => {
  try {
    if (!isFirebaseConfigured || !db) {
      const localSessions = JSON.parse(localStorage.getItem('interviewSessions') || '{}');
      return Object.values(localSessions).filter(
        (s): s is StoredSession => typeof s === 'object' && s !== null && 'sessionId' in s && 'timestamp' in s
      ).sort((a, b) => b.timestamp - a.timestamp);
    }

    const sessionsRef = dbRef(db, "candidates");
    const snapshot = await get(sessionsRef);
    if (!snapshot.exists()) return [];
    
    const sessions = Object.values(snapshot.val() || {}).filter(
      (s): s is StoredSession => typeof s === 'object' && s !== null && 'sessionId' in s && 'timestamp' in s
    );
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error getting all sessions:", error.message, error.stack);
    const localSessions = JSON.parse(localStorage.getItem('interviewSessions') || '{}');
    return Object.values(localSessions).filter(
      (s): s is StoredSession => typeof s === 'object' && s !== null && 'sessionId' in s && 'timestamp' in s
    ).sort((a, b) => b.timestamp - a.timestamp);
  }
};

export const clearSessions = async (): Promise<void> => {
  try {
    if (!isFirebaseConfigured || !db) {
      localStorage.removeItem('interviewSessions');
      console.log("All local sessions cleared");
      return;
    }

    const sessionsRef = dbRef(db, "candidates");
    await set(sessionsRef, null); // CHANGE: Clear all sessions by setting to null
    console.log("All sessions cleared from Realtime Database");
  } catch (error) {
    console.error("Error clearing sessions:", error.message, error.stack);
    localStorage.removeItem('interviewSessions');
    console.log("All local sessions cleared as fallback");
  }
};