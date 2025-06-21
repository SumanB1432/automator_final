"use client";
import React, { useState, useEffect, useRef } from "react";
import { ref, getDatabase, update } from "firebase/database";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { pdfjs } from "react-pdf";
import { toast } from "react-toastify";
import {
  uploadBytes,
  getDownloadURL,
  ref as storageRef,
} from "firebase/storage";
import { storage } from "@/firebase/config";
import app from "@/firebase/config";

pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs/pdf.worker.min.js`;

const Resume: React.FC = () => {
  const [pdf, setPdf] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [Currentctc, setCurrentctc] = useState<string>("");
  const [Expectedctc, setExpectedctc] = useState<string>("");
  const [NoticePeriod, setNoticePeriod] = useState<string>("");
  const [Resume, setResume] = useState<string>("");
  const [pdfText, setPdfText] = useState<string>("");
  const [Location, setLocation] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const auth = getAuth();
  const db = getDatabase(app);

  // Ensure the user is authenticated before proceeding
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("User signed in:", currentUser); // Debugging user data
      } else {
        setUser(null);
        console.log("No user signed in");
        toast.error("You need to be signed in to upload your resume.");
        window.location.href = "/sign-in"
      }
    });

    return () => unsubscribe();
  }, []);

  console.log("User before uploading resume:", user);

  useEffect(() => {
    if (downloadUrl && pdfText && submitButtonRef.current) {
      submitButtonRef.current.click();
    }
  }, [downloadUrl, pdfText]);




  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    setIsLoading(true);
    setPdfName(file.name);
    setPdf(file);

    const pdfStorageRef = storageRef(storage, `Resume/${file.name}`);

    try {
      await uploadBytes(pdfStorageRef, file);
      const url = await getDownloadURL(pdfStorageRef);
      setDownloadUrl(url);

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;

        const typedarray = new Uint8Array(e.target.result as ArrayBuffer);
        const pdfDocument = await pdfjs.getDocument(typedarray).promise;
        let fullText = "";

        for (let i = 1; i <= pdfDocument.numPages; i++) {
          const page = await pdfDocument.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => (item as { str: string }).str) //possibility of error
            .join(" ");
          fullText += pageText + "\n";
        }

        setPdfText(fullText);
        setResume(file.name);
        setIsLoading(false);
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload the file. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("User before submitting:", user); // Debugging user data before submission
    function notifyExtensionOnResumeSubmit(urdData: unknown) {
      const event = new CustomEvent('resumeUpdated', {
        detail: {
          urd: urdData,
        }
      });
      document.dispatchEvent(event);
    }


    if (!pdfName) {
      toast.error("Please Provide Your Resume Before Submitting!");
      return;
    }
    if (!downloadUrl || !pdfText) {
      toast.warning(
        "Your Resume is still being processed. Please wait a moment and try again."
      );
      return;
    }
    if (!user) {
      toast.error("User is not authenticated. Please sign in again.");
      return;
    }

    const uid = user.uid;
    const userRef = ref(db, `user/${uid}`);
    const urdData = `${pdfText} currentCtc ${Currentctc}; ExpectedCtc ${Expectedctc}; NoticePeriod ${NoticePeriod}; Location ${Location}`;

    try {
      await update(userRef, {
        forms: {
          keyvalues: {
            RD: downloadUrl,
            URD: urdData,
          },
        },
      });

      toast.success("Document updated successfully!");
      notifyExtensionOnResumeSubmit(urdData)
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)




    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting."
      );
    }
  };


  const handleRemovePdf = () => {
    setPdf(null);
    setPdfName("");
    setDownloadUrl("");
    setPdfText("");
    setResume("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#11011E] via-[#35013E] to-[#11011E] px-4">
      <div className="flex flex-col md:flex-row items-center justify-center mx-auto gap-40">

        {/* Left Illustration */}
        <div className="hidden md:block md:w-1/3">
          <img
            src="images/lastStepAvtar.png"
            alt="Illustration"
            className="max-w-sm mx-auto"
          />
        </div>
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
            <p className="ml-4 text-white text-lg">
              Processing your resume... Please wait.
            </p>
          </div>
        )}
        <div className="w-full md:w-2/3 p-6 rounded-lg shadow-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
          <h2 className="text-2xl font-semibold font-raleway text-[#ECF1F0] mb-text-2xl font-raleway font-semibold mb-6 text-center animate-slideDown text-[#ECF1F0]">
            Update Your Details
          </h2>
          {/* <p className="text-center text-gray-600 mb-4">
            Start Auto-applying now!
          </p> */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-[#B6B6B6] mb-1">
                Current CTC in your local currency?
              </label>
              <input
                type="text"
                placeholder="Current CTC"
                className="border border-[rgba(255,255,255,0.1)] w-full px-3 py-2 rounded-md bg-[#1A1A2E] text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] placeholder-[#B6B6B6]"
                required
                onChange={(e) => setCurrentctc(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-[#B6B6B6] mb-1">
                Expected CTC in your local currency?
              </label>
              <input
                type="text"
                placeholder="Expected CTC"
                className="border border-[rgba(255,255,255,0.1)] w-full px-3 py-2 rounded-md bg-[#1A1A2E] text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] placeholder-[#B6B6B6]"
                required
                onChange={(e) => setExpectedctc(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-[#B6B6B6] mb-1">
                What is your notice period in days?
              </label>
              <input
                type="text"
                placeholder="Notice Period"
                className="border border-[rgba(255,255,255,0.1)] w-full px-3 py-2 rounded-md bg-[#1A1A2E] text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] placeholder-[#B6B6B6]"
                required
                onChange={(e) => setNoticePeriod(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-[#B6B6B6] mb-1">
                Your preferred location in the job?
              </label>
              <input
                type="text"
                placeholder="Preferred Locations"
                className="border border-[rgba(255,255,255,0.1)] w-full px-3 py-2 rounded-md bg-[#1A1A2E] text-[#ECF1F0] focus:outline-none focus:ring-2 focus:ring-[#0FAE96] placeholder-[#B6B6B6]"
                required
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <br></br>
            {/* Upload Resume */}
            <label htmlFor="file-upload" className="cursor-pointer">
              Upload Your Resume
              <div className="border border-dashed border-[#B6B6B6] rounded-md p-4 text-center text-[#B6B6B6] cursor-pointer hover:bg-[#1A1A2E]">
                <input
                  type="file"
                  id="file-upload"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <img
                  src="images/file.png"
                  alt="Upload Resume"
                  className="w-10 h-10 mx-auto mb-2"
                />
                <p className="text-sm text-[#ECF1F0]">Upload Resume</p>
              </div>
            </label>

            {pdfName ? (
              <div className="flex items-center justify-between bg-[#1A1A2E] text-[#84CC16] px-4 py-2 rounded-md mt-2">
                <span>{pdfName}</span>
                <button
                  type="button"
                  onClick={handleRemovePdf}
                  className="text-red-500 hover:text-red-700 font-semibold transition duration-200"
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="text-center text-red-700">No file selected</p>
            )}
            <button
              ref={submitButtonRef}
              type="submit"
              className="w-full py-2 bg-[#0FAE96] text-[#FFFFFF] rounded-md font-raleway font-medium text-base hover:opacity-90"
              disabled={isLoading}
            >
              Submit
            </button>
            {/* need to be removed */}
            <p>Selected File: {Resume}</p>
            {pdf && (
              <iframe
                src={URL.createObjectURL(pdf)}
                width="100%"
                height="500px"
                title="PDF Viewer"
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Resume;

