import SignUp from "@/features/auth/components/sign-up";

export default function SignUpPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left Column - Sign In Form */}
      <div className="flex items-center justify-center p-8">
        <SignUp />
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
