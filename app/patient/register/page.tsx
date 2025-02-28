import { RegisterForm } from "@/components/regi-form";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Register | Your Total Foot Care Specialist",
  description: "Create a new account for the YTFCS patient portal",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      {/* Background with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/images/home_bg2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <Image
              src="/assets/images/logo-480.svg"
              alt="YTFCS Logo"
              width={36}
              height={36}
              className="h-8 w-8 sm:h-9 sm:w-9"
            />
            <span className="font-medium text-white">YTFCS</span>
          </div>
        </Link>
      </div>

      {/* Registration container */}
      <div className="relative z-10 w-full max-w-md px-4 py-8 sm:px-0">
        <RegisterForm />

        {/* Help text */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            Need help? Contact support at{" "}
            <a
              href="mailto:support@ytfcs.com"
              className="text-blue-400 hover:text-blue-300"
            >
              support@ytfcs.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
