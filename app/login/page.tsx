import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat sm:bg-cover"
        style={{ backgroundImage: "url('/assets/images/home_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#EAF4F7] opacity-70"></div>
      </div>
      <div className="absolute w-full max-w-sm p-1">
        <LoginForm />
      </div>
    </div>
  );
}
