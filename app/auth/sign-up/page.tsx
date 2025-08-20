import { SignUpForm } from "@/components/sign-up-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Network Security Suite</h1>
          <p className="text-gray-400">Create your account to get started</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
