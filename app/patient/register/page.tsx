import { RegisterForm } from "@/components/regi-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat sm:bg-cover"
        style={{ backgroundImage: "url('/assets/images/home_bg2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      <div className="absolute w-full max-w-sm p-2">
        <RegisterForm />
      </div>
    </div>
  );
}
