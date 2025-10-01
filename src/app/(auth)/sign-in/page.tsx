import SignIn from "@/features/auth/components/sign-in";

export default function SignInPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left Column - Sign In Form */}
      <div className="flex items-center justify-center p-8">
        <SignIn />
      </div>
      
      {/* Right Column - Visual/Branding */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="text-center text-white p-8">
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-xl opacity-90">Sign in to continue to your account</p>
        </div>
      </div>
    </div>
  );
}
