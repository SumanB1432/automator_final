import { getDatabase, ref, get } from "firebase/database";
import app from "@/firebase/config";

export async function fetchUserDetails(userId: string): Promise<{ apiKey: string; urd: string; rd: string } | null> {
  try {
    const db = getDatabase(app);
    const userRef = ref(db, `user/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();

      const apiKey = userData.API?.apiKey ?? userData.API?.apikey ?? "API_KEY_NOT_FOUND";
      const urd = userData.forms?.keyvalues?.URD ?? "URD_NOT_FOUND";
      const rd = userData.forms?.keyvalues?.RD ?? "RD_DATA_NOT_FOUND";

      console.log(apiKey, "api key from fetchUserDetails");

      return { apiKey, urd, rd };
    } else {
      console.log("User data not found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}
