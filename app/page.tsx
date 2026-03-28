export default function Page() {
  return (
    <div className="min-h-screen bg-school-teal-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-school-teal flex items-center justify-center mx-auto">
          <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
            <rect x="17" y="2" width="6" height="36" rx="2" fill="white" />
            <rect x="2" y="14" width="36" height="6" rx="2" fill="white" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800">Baildon School</h1>
        <p className="text-gray-500 text-sm">
          The parent assistant is currently offline. Please check back soon.
        </p>
        <p className="text-xs text-gray-400">baildonce.co.uk</p>
      </div>
    </div>
  );
}
