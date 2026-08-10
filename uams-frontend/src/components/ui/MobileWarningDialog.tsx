"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import Dialog from "./Dialog";
import { LaptopMinimal, Smartphone } from "lucide-react";

export default function MobileWarningDialog() {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem("hide-mobile-warning");

    if (hidden) return;

    if (window.innerWidth < 768) {
      setTimeout(() => {
        setOpen(true);
      }, 0);
    }
  }, []);

  const handleContinue = () => {
    if (dontShow) {
      localStorage.setItem("hide-mobile-warning", "true");
    }

    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
    >
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <LaptopMinimal className="h-10 w-10 text-blue-600" />
        </div>
      </div>

      <h2 className="mt-5 text-center text-2xl font-bold">
        Desktop Recommended
      </h2>

      <p className="mt-4 text-center text-gray-600 leading-7">
        UAMS Admin Dashboard is optimized for desktop and tablet devices.
        <br />
        You can continue on your phone, but some features may not be compatible.
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-xl bg-blue-50 p-4">
        <Smartphone className="text-blue-600" />

        <p className="text-sm text-gray-600">
          For the best experience, use a laptop or tablet.
        </p>
      </div>

      <label className="mt-6 flex items-center gap-3">
        <input
          type="checkbox"
          checked={dontShow}
          onChange={(e) => setDontShow(e.target.checked)}
        />

        <span className="text-sm">
          Don&apos;t show this again
        </span>
      </label>

      <Button
        onClick={handleContinue}
        className="
          mt-8
          w-full
          rounded-xl
          transition
        "
      >
        Continue
      </Button>
    </Dialog>
  );
}