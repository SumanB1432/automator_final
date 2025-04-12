'use client'
// import { useState } from 'react';
import {useCreateUserWithEmailAndPassword} from "react-firebase-hooks/auth";
import {auth} from "@/firebase/config";

// const SignUp = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);

//   const handleSignUp = async () => {
//     try {
//         const res = await createUserWithEmailAndPassword(email, password)
//         console.log({res})
//         sessionStorage.setItem('user', 'true')
//         setEmail('');
//         setPassword('')

//     } catch(e){
//         console.error(e)
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-900">
//       <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
//         <h1 className="text-white text-2xl mb-5">Sign Up</h1>
//         <input 
//           type="email" 
//           placeholder="Email" 
//           value={email} 
//           onChange={(e) => setEmail(e.target.value)} 
//           className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
//         />
//         <input 
//           type="password" 
//           placeholder="Password" 
//           value={password} 
//           onChange={(e) => setPassword(e.target.value)} 
//           className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
//         />
//         <button 
//           onClick={handleSignUp}
//           className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
//         >
//           Sign Up
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SignUp;
import React from 'react';
import { useState } from 'react';
import Link from 'next/link';

// interface SignUpFormData {
//   firstName: string;
//   lastName: string;
// }

const SignUpPage = () => {
  // const [formData, setFormData] = useState<SignUpFormData>({
  //   firstName: '',
  //   lastName: ''
  // });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);

  const handleSignUp = async () => {
        try {
            const res = await createUserWithEmailAndPassword(email, password)
            console.log({res})
            sessionStorage.setItem('user', 'true')
            setEmail('');
            setPassword('')
    
        } catch(e){
            console.error(e)
        }
      };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 to-purple-900 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-purple-900/80 to-purple-800/50 p-8 rounded-2xl shadow-xl w-full max-w-md backdrop-blur-sm border border-purple-800/30">
          <h1 className="text-white text-2xl font-semibold text-center mb-8">
            Sign Up
          </h1>

          {/* Social Sign Up Buttons */}
          <div className="space-y-3 mb-6">
            <button className="w-full bg-white/10 text-white py-3 px-4 rounded-lg hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2 border border-white/10">
              <span>Sign up with Google</span>
            </button>
            <button className="w-full bg-white/10 text-white py-3 px-4 rounded-lg hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2 border border-white/10">
              <span>Sign up with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-purple-600/30"></div>
            <span className="text-gray-400 text-sm uppercase">OR</span>
            <div className="flex-1 h-px bg-purple-600/30"></div>
          </div>

            <div>
              <input
                type="text"
                placeholder="Email"
                className="w-full bg-transparent border-b border-purple-600/30 py-2 text-white focus:outline-none focus:border-teal-400 transition-colors placeholder:text-gray-400"
                value={email}
                onChange={(e) => setEmail( e.target.value )}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="PassWord"
                className="w-full bg-transparent border-b border-purple-600/30 py-2 text-white focus:outline-none focus:border-teal-400 transition-colors placeholder:text-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value )}
              />
            </div>
            <button
              onClick={handleSignUp}
              className="w-full bg-teal-400 text-white py-3 rounded-lg hover:bg-teal-500 transition-colors duration-200 mt-8 font-medium"
            >
              Create Account
            </button>
          {/* </form> */}

          {/* Login Link */}
          <p className="text-center text-gray-400 mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-teal-400 hover:text-teal-500 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-gray-400 p-8 bg-gradient-to-b from-transparent to-purple-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">About Us</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About</Link></li>
              <li><Link href="/careers" className="hover:text-teal-400 transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-teal-400 transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link href="/services" className="hover:text-teal-400 transition-colors">All Services</Link></li>
              <li><Link href="/crypto" className="hover:text-teal-400 transition-colors">Buy Crypto</Link></li>
              <li><Link href="/financial" className="hover:text-teal-400 transition-colors">Financial Services</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Learn</h3>
            <ul className="space-y-2">
              <li><Link href="/learn" className="hover:text-teal-400 transition-colors">What is Cryptocurrency?</Link></li>
              <li><Link href="/chain" className="hover:text-teal-400 transition-colors">Chain Basics</Link></li>
              <li><Link href="/market" className="hover:text-teal-400 transition-colors">Market Update</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignUpPage;