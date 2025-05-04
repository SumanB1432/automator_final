// src/utils/saveCandidate.ts
import { Candidate } from '@/types/candidate';
import app from '@/firebase/config';
import { getDatabase,set,ref } from 'firebase/database';

export const saveCandidateToFirestore = async (candidateData: Candidate) => {
  try {
    const db = getDatabase(app);
    const safeEmail = candidateData.email.replace(/\./g, ',');
    const candidateRef = ref(db, `talent_pool/${safeEmail}`);
    await set(candidateRef, candidateData);
    console.log('✅ Candidate saved successfully');
  } catch (error) {
    console.error('❌ Error saving candidate:', error);
  }
};

