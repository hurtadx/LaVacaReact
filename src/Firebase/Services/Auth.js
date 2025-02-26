import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";  
import { auth } from "../config";  


export const registerUser = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    
    await updateProfile(userCredential.user, {
      displayName: username
    });
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    
    const errorCode = error.code;
    let errorMessage;
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        errorMessage = 'email-already-in-use';
        break;
      case 'auth/invalid-email':
        errorMessage = 'invalid-email';
        break;
      case 'auth/weak-password':
        errorMessage = 'weak-password';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'operation-not-allowed';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { user: null, error: errorMessage };
  }
};


export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    
    const errorCode = error.code;
    let errorMessage;
    
    switch (errorCode) {
      case 'auth/user-not-found':
        errorMessage = 'user-not-found';
        break;
      case 'auth/wrong-password':
        errorMessage = 'wrong-password';
        break;
      case 'auth/invalid-email':
        errorMessage = 'invalid-email';
        break;
      case 'auth/user-disabled':
        errorMessage = 'user-disabled';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'too-many-requests';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { user: null, error: errorMessage };
  }
};


export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};