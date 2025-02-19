import { X } from "lucide-react";
import { useState } from "react";

export default function Kiosk() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex h-full w-full items-center justify-center p-6 md:p-10 bg-gray-100">
      <button
        onClick={() => setIsOpen(true)}
        className="border border-primary p-2 px-4 cursor-pointer rounded-lg text-primary font-semibold text-sm hover:bg-primary hover:text-white h-10"
      >
        Start KIOSK
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white shadow-lg flex flex-col p-2">
          {/* Modal Header */}
          <div className="flex justify-between items-center border-b">
            <h2 className="text-lg font-semibold text-gray-800">KIOSK</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-black"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src="http://localhost:3001/"
              className="w-full h-full"
              title="Integrated React App"
              style={{
                border: "none",
                overflow: "auto",
              }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
