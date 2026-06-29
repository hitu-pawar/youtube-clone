import { db } from "./firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

// Like status get kar
export const getLikeStatus = async (userId, videoId) => {
  const ref = doc(db, "likes", `${userId}_${videoId}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null; // null = neither liked nor disliked
  return snap.data().type; // "like" or "dislike"
};

// Like/Dislike toggle kar
export const toggleLike = async (userId, videoId, type) => {
  const ref = doc(db, "likes", `${userId}_${videoId}`);
  const snap = await getDoc(ref);

  if (snap.exists() && snap.data().type === type) {
    // Same button again click = remove
    await deleteDoc(ref);
    return null;
  } else {
    // New like/dislike set kar
    await setDoc(ref, { userId, videoId, type, createdAt: new Date().toISOString() });
    return type;
  }
};