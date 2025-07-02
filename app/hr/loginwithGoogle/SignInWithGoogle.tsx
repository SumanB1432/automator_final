"use client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { getDatabase, ref, set, get } from "firebase/database";
import google from "./igoogle.svg";
import Image from "next/image";
import axios from "axios";
// import { checkEmailType } from "../utils/emailCheck";

function SignInwithGoogle() {
  function googleLogin() {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider).then(async (result) => {
      const user = result.user;
      let name = user.displayName;
      let email = user.email;
      let profilePhoto = user.photoURL;
      // const emailCheck = checkEmailType(email);
      // if (emailCheck.message == false) {
      //   toast.error("Only company/HR emails are allowed.", { position: "top-center" });
      //   return; // ⛔ Stop further execution
      // }
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
          localStorage.setItem("api_keyforHR", apiKey);
          localStorage.setItem("UIDforHR", user?.uid);
          localStorage.setItem("IsLoginAsHR", true);
          localStorage.setItem("UserNameforHR", user.displayName);
          const subRef = ref(db, `hr/${user.uid}/Payment/SubscriptionType`);
          const subSnapshot = await get(subRef);
          localStorage.setItem("SubscriptionType", subSnapshot.val());

          //SAVE REFERRAL IN DB IF EXIST
           const getReferralCodeFromCookie = () => {
                    const cookie = document.cookie.split('; ').find(row => row.startsWith('referral='));
                    return cookie ? cookie.split('=')[1] : null;
                  };
                  const referralCode = getReferralCodeFromCookie()
                  //** SAVE REFERAL CODE IN DATABASE  */
                  const currentDate = new Date();
                  const formattedDateTime = currentDate.toISOString().replace("T", " ").split(".")[0];
                  const currentUser = auth?.currentUser?.uid;
          
                  if (referralCode) {
                    console.log("Save in database/firebase")
                    const newDocRef = ref(db, `/referrals/${referralCode}/${currentUser}`);
                    console.log(newDocRef, typeof (newDocRef), "referrals");
                    get(newDocRef).then((snapshot) => {
                      if (!snapshot.exists()) {
                        // If the referral code doesn't exist, create a new entry
                        set(newDocRef, {
                          signupDate: formattedDateTime,
                          amount: 0,
                        }).then(() => {
          
                        })
                      }
                    })
                  }
          
        };

        const redirectUserBasedOnStatus = async () => {
          const getSubscription = ref(db, `hr/${user.uid}/Payment/SubscriptionType`);
          const getForm = ref(db, `hr/${user.uid}/forms`);
          const subscriptionSnapshot = await get(getSubscription);
          const formSnapshot = await get(getForm);
          const subscriptionType = subscriptionSnapshot.val();

          // function notifyExtensionOnLogin(uid) {
          //   const event = new CustomEvent("userLoggedIn", { detail: { uid } });
          //   document.dispatchEvent(event);
          // }
          // notifyExtensionOnLogin(user.uid);

          if (!subscriptionType) {
            window.location.href = "/hr/gemini";
          } else if (
            subscriptionType === "Free" ||
            subscriptionType === "Premium"
          ) {
            window.location.href = "/hr";
          } else {
            window.location.href = "/hr";
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
