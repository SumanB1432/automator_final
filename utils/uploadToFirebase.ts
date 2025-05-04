// src/utils/uploadToFirebase.ts
import { storage } from '@/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadResumeToFirebase = async (file: File) => {
  const filePath = `resumes/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};
