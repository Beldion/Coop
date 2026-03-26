import React from "react";

function Loader() {
  return (
    <div class="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div class="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-gray-600 text-sm">Loading, please wait...</p>
    </div>
  );
}

export default Loader;
