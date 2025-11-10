import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-(--bg)">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}