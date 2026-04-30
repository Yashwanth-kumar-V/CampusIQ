import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase automatically tracks login state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get extra user data (name, role) from Firestore
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: data.name,
            role: data.role,
            avatar: data.name?.slice(0, 2).toUpperCase() || 'U',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // cleanup on unmount
  }, []);

  // SIGNUP — creates Firebase Auth account + saves profile in Firestore
  const signup = async ({ name, email, password, role }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Save name and role to Firestore 'users' collection
    await setDoc(doc(db, 'users', uid), {
      name,
      email,
      role: role || 'Student',
      createdAt: new Date().toISOString(),
    });
  };

  // LOGIN — Firebase email/password login
  const loginWithEmail = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged above will automatically update the user state
  };

  // LOGOUT
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;