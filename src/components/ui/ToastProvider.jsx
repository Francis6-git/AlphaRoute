import { Toaster as Sonner } from "sonner";

export const ToastProvider = () => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-alpha-bg border border-white/10 text-white rounded-none shadow-2xl font-mono",
          description: "text-white/60 text-xs",
          actionButton:
            "bg-alpha-primary text-black rounded-none px-3 py-1 font-bold",
          cancelButton: "bg-white/10 text-white rounded-none",
          success: "border-green-500/50 bg-green-500/5",
          error: "border-red-500/50 bg-red-500/5",
          info: "border-blue-500/50 bg-blue-500/5",
        },
      }}
    />
  );
};
