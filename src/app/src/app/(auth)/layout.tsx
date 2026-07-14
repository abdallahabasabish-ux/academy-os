export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        {children}
      </div>
    </div>
  );
}
