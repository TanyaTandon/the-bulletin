
const handleSignIn = async () => {
  if (!validatePhoneNumber(phoneNumber)) {
    toast.error("Please enter a valid phone number");
    console.error("Sign-in validation failed: Invalid phone number");
    return;
  }
  
  setIsProcessing(true);
  try {
    await signIn.create({
      strategy: "phone_code",
      identifier: phoneNumber,
    });
    
    setSignInStep(1);
    toast.success("We've sent you a verification code!");
    console.log("Verification code sent successfully");
  } catch (error) {
    console.error("Detailed Sign-in Error:", {
      error: error,
      phoneNumber: phoneNumber,
      timestamp: new Date().toISOString()
    });
    toast.error("Sign-in failed. Please check your phone number and try again.");
  } finally {
    setIsProcessing(false);
  }
};

const handleVerifySignIn = async () => {
  if (!code || code.trim() === "") {
    toast.error("Please enter the verification code");
    console.error("Code verification failed: Empty code");
    return;
  }
  
  setIsProcessing(true);
  try {
    const result = await signIn.attemptFirstFactor({
      strategy: "phone_code",
      code: code,
    });
    
    if (result?.identifier) {
      const phone = result.identifier.split("+1")[1];
      await dispatch(fetchUser(phone));
      navigate("/bulletin");
      toast.success("Welcome back! You're now signed in.");
      console.log("Sign-in verification successful");
    } else {
      console.error("Sign-in verification result did not contain an identifier");
      toast.error("Verification failed. Please try again.");
    }
  } catch (error) {
    console.error("Detailed Code Verification Error:", {
      error: error,
      code: code,
      timestamp: new Date().toISOString()
    });
    toast.error("Code verification failed. Please double-check and try again.");
  } finally {
    setIsProcessing(false);
  }
};
