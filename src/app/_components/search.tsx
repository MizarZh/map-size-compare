"use client";

import React from "react";
import type { GeoJsonObject, FeatureCollection } from "geojson";

const Search = () => {
  return (
    <div className="absolute top-3 left-3 z-10 flex items-center">
      <input
        type="text"
        placeholder="Search country..."
        className="h-14 w-140 rounded-md border border-gray-300 bg-gray-50 py-2 pr-10 pl-3 text-2xl text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          className="h-5 w-5 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default Search;
