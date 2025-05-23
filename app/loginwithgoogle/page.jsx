"use client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { getDatabase, ref, set, get } from "firebase/database";
import google from "./igoogle.svg"
import Image from "next/image";
import axios from "axios";
function SignInwithGoogle() {
  function googleLogin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(async (result) => {
      // console.log(result);
      const user = result.user;
      let name = user.displayName;
      let email = user.email;
      let profilePhoto = user.photoURL
      const db = getDatabase(app)


      const userRef = ref(db, "user/" + user.uid);
      get(userRef).then(async (snapshot) => {

        if (snapshot.exists()) {
          toast.success("User logged in Successfully", {
            position: "top-center",
          });

          const apiRef1 = ref(db, `user/${user.uid}/API/apiKey`);
          const apiRef2 = ref(db, `user/${user.uid}/API/apikey`)
          const apiSnapshot1 = await get(apiRef1);
          const apiSnapshot2 = await get(apiRef2)


          let apiKey = "";
          apiSnapshot1.exists() ? apiKey = apiSnapshot1.val() : apiKey = apiSnapshot2.val()
          console.log(apiKey, "from submit")
          localStorage.setItem("api_key", apiKey);

          localStorage.setItem('UID', user?.uid);
          localStorage.setItem("IsLogin", true);
          localStorage.setItem("UserName", user.displayName);
          const subRef = ref(db, `user/${user.uid}/Payment/SubscriptionType`)
          const subSnapshot = await get(subRef);
          let subType = subSnapshot.val()
          localStorage.setItem("SubscriptionType", subType)
          try {

            const user = auth.currentUser;
            console.log(user, "user value");



            if (user) {


              // Reference for Subscription status and Form status
              const getSubscription = ref(db, `user/${auth?.currentUser?.uid}/Payment/SubscriptionType`);
              const subscriptionSnapshot = await get(getSubscription)
              const getForm = ref(db, `user/${auth?.currentUser?.uid}/forms`);
              const formSnapshot = await get(getForm)
              const subscriptionType = subscriptionSnapshot.val();

              function notifyExtensionOnLogin(uid) {
                const event = new CustomEvent('userLoggedIn', { detail: { uid } });
                console.log("event1")
                document.dispatchEvent(event);
              }
              notifyExtensionOnLogin(user.uid)

              if (!subscriptionType) {
                // If Subscriptiontype is undefined, redirect to Gemini page
                window.location.href = "/gemini";
              } else if (!formSnapshot.exists()) {
                // Redirect to Resume page if resume is not uploaded
                window.location.href = "/resume2";
              } else if (subscriptionType === "GetResume") {
                // Redirect to Resume page if the subscription type is "GetResume"
                window.location.href = "/resume2";
              } else if (subscriptionType === "FreeTrialStarted" || subscriptionType === "Premium") {
                // Redirect to Demo page if the user has a FreeTrial or Premium subscription
                window.location.href = "/";
              } else {
                // Fallback to Gemini if the subscription type is not recognized
                window.location.href = "/gemini";
              }
            }


          } catch (error) {
            console.error("Login error:", error.message);
            toast.error(error.message, { position: "bottom-center" });
          }



        }
        else {
          console.log("user creating")
          const newDocRef = ref(db, "user/" + auth.currentUser.uid)
          set(newDocRef, {
            name: name,
            email: email,
            profilePhoto: profilePhoto


          }).then(async () => {
            await axios.post("https://us-central1-jobform-automator-website.cloudfunctions.net/welcomeEmailHR/send-email", {
              email: email,
              name: name || "User",
            }).then(() => {

            }).catch((err) => {
              toast.error(err.message)
            });


            // setMessage("Login successful! Welcome email sent.");
            toast.success("Registered!", {
              position: "top-center",

            });
            const user = result.user;
            const apiRef1 = ref(db, `user/${user.uid}/API/apiKey`);
            const apiRef2 = ref(db, `user/${user.uid}/API/apikey`)
            const apiSnapshot1 = await get(apiRef1);
            const apiSnapshot2 = await get(apiRef2)


            let apiKey = "";
            apiSnapshot1.exists() ? apiKey = apiSnapshot1.val() : apiKey = apiSnapshot2.val()
            console.log(apiKey, "from submit")
            localStorage.setItem("api_key", apiKey);

            localStorage.setItem('UID', user?.uid);
            localStorage.setItem("IsLogin", true);
            localStorage.setItem("UserName", user.displayName);
            const subRef = ref(db, `user/${user.uid}/Payment/SubscriptionType`)
            const subSnapshot = await get(subRef);
            let subType = subSnapshot.val()
            localStorage.setItem("SubscriptionType", subType)
            try {

              const user = auth.currentUser;
              // const user = auth.currentUser;
              console.log(user, "user value")

              if (user) {


                // Reference for Subscription status and Form status
                const getSubscription = ref(db, `user/${auth?.currentUser?.uid}/Payment/SubscriptionType`);
                const subscriptionSnapshot = await get(getSubscription)
                const getForm = ref(db, `user/${auth?.currentUser?.uid}/forms`);
                const formSnapshot = await get(getForm)


                const subscriptionType = subscriptionSnapshot.val();
                //**Event listener */
                function notifyExtensionOnLogin(uid) {
                  console.log("Event listner")
                  const event = new CustomEvent('userLoggedIn', { detail: { uid } });
                  document.dispatchEvent(event);
                }
                console.log(auth.currentUser.uid, "uid")
                notifyExtensionOnLogin(user.uid)


                // console.log(subscriptionType + "Hello")
                // console.log(formSnapshot.val(), "form")
                const getReferralCodeFromCookie = () => {
                  const cookie = document.cookie.split('; ').find(row => row.startsWith('referral='));
                  return cookie ? cookie.split('=')[1] : null;
                };
                const referralCode = getReferralCodeFromCookie()
                console.log(referralCode, "code", typeof (referralCode))

                //** SAVE REFERAL CODE IN DATABASE  */
                const currentDate = new Date();
                const formattedDateTime = currentDate.toISOString().replace("T", " ").split(".")[0];
                let currentUser = user.uid;


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


                if (!subscriptionType) {
                  // If Subscriptiontype is undefined, redirect to Gemini page
                  window.location.href = "/gemini";
                } else if (!formSnapshot.exists()) {
                  // Redirect to Resume page if resume is not uploaded
                  window.location.href = "/resume2";
                } else if (subscriptionType === "GetResume") {
                  // Redirect to Resume page if the subscription type is "GetResume"
                  window.location.href = "/resume2";
                } else if (subscriptionType === "FreeTrialStarted" || subscriptionType === "Premium") {
                  // Redirect to Demo page if the user has a FreeTrial or Premium subscription
                  window.location.href = "/";
                } else {
                  // Fallback to Gemini if the subscription type is not recognized
                  window.location.href = "/gemini";
                }
              }

            } catch (error) {
              console.error("Login error:", error.message);
              toast.error(error.message, { position: "bottom-center" });
            }

          }).catch((err) => {
            toast.error(err.message)

          })
        }
      })


    });
  }
  return (


    <div className="flex justify-center">
      <button
        type="button"
        className="w-full flex items-center justify-center bg-[#1A1A2E] border border-gray-600 text-white p-3 rounded-lg hover:bg-[#0FAE96] transition"
        onClick={googleLogin}
      >
        <Image
          src={google}
          alt="Google icon"
          style={{
            width: '24px',
            height: '24px',
            marginRight: '12px'
          }}
        />
        Sign in with Google
      </button>
    </div>

  );
}
export default SignInwithGoogle;
