"use client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { getDatabase, ref, set, get } from "firebase/database";
import google from "./igoogle.svg";
import Image from "next/image";
import axios from "axios";

function SignInwithGoogle() {
  function googleLogin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(async (result) => {
      const user = result.user;
      let name = user.displayName;
      let email = user.email;
      let profilePhoto = user.photoURL;
      const db = getDatabase(app);

      const userRef = ref(db, "hr/" + user.uid);
      get(userRef).then(async (snapshot) => {
        const setCommonLocalStorage = async () => {
          const apiRef1 = ref(db, `hr/${user.uid}/API/apiKey`);
          const apiRef2 = ref(db, `hr/${user.uid}/API/apikey`);
          const apiSnapshot1 = await get(apiRef1);
          const apiSnapshot2 = await get(apiRef2);
          let apiKey = "";
          apiSnapshot1.exists()
            ? (apiKey = apiSnapshot1.val())
            : (apiKey = apiSnapshot2.val());
          localStorage.setItem("api_key", apiKey);
          localStorage.setItem("UID", user?.uid);
          localStorage.setItem("IsLogin", true);
          localStorage.setItem("UserName", user.displayName);
          const subRef = ref(db, `hr/${user.uid}/Payment/SubscriptionType`);
          const subSnapshot = await get(subRef);
          localStorage.setItem("SubscriptionType", subSnapshot.val());
        };

        const redirectUserBasedOnStatus = async () => {
          const getSubscription = ref(db, `hr/${user.uid}/Payment/SubscriptionType`);
          const getForm = ref(db, `hr/${user.uid}/forms`);
          const subscriptionSnapshot = await get(getSubscription);
          const formSnapshot = await get(getForm);
          const subscriptionType = subscriptionSnapshot.val();

          function notifyExtensionOnLogin(uid) {
            const event = new CustomEvent("userLoggedIn", { detail: { uid } });
            document.dispatchEvent(event);
          }
          notifyExtensionOnLogin(user.uid);

          if (!subscriptionType) {
            window.location.href = "hr/gemini";
          }else if (
            subscriptionType === "FreeTrialStarted" ||
            subscriptionType === "Premium"
          ) {
            window.location.href = "/hr";
          } else {
            window.location.href = "hr/gemini";
          }
        };

        if (snapshot.exists()) {
          toast.success("User logged in Successfully", { position: "top-center" });
          await setCommonLocalStorage();
          await redirectUserBasedOnStatus();
        } else {
          const newDocRef = ref(db, "hr/" + auth.currentUser.uid);
          set(newDocRef, {
            name: name,
            email: email,
            profilePhoto: profilePhoto,
          })
            .then(async () => {
              await axios.post(
                "https://welcomeemail-hrjd6kih3q-uc.a.run.app/send-email",
                {
                  email: email,
                  name: name || "User",
                }
              ).catch((err) => {
                toast.error(err.message);
              });

              toast.success("Registered!", { position: "top-center" });
              await setCommonLocalStorage();


   

              await redirectUserBasedOnStatus();
            })
            .catch((err) => toast.error(err.message));
        }
      });
    }).catch((error) => {
      console.error("Login error:", error.message);
      toast.error(error.message, { position: "bottom-center" });
    });
  }

  return (
    <div className="flex justify-center">
      <button
        type="button"
        className="w-full max-w-md flex items-center justify-center bg-[#2A0A3A] text-white border border-[#3E3E3E] p-3 rounded-2xl hover:bg-[#0FAE96] hover:text-black transition-all duration-300 shadow-lg"
        onClick={googleLogin}
      >
        <Image
          src={google}
          alt="Google icon"
          width={24}
          height={24}
          className="mr-3"
        />
        Sign in with Google
      </button>
    </div>
  );
}

export default SignInwithGoogle;
