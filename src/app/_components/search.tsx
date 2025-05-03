"use client";
import React, { useState } from "react";
import { api } from "~/trpc/react";

const Search = () => {
  const searchWidth = "w-140";
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([] as string[]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const names = api.geoJSON.getGeoJSON.useQuery({ country: searchTerm });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    if (newSearchTerm) {
      console.log(names.data);
      const results: string[] = ["test", "test2", "test3"];
      setSearchResults(results);
      setIsDropdownOpen(true);
    } else {
      setSearchResults([]);
      setIsDropdownOpen(false);
    }
  };

  const handleClick = (result: string) => {
    // console.log(result);
    setSearchTerm("");
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  return (
    <div className="absolute top-3 left-3 z-10">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Search country..."
          className={`h-14 ${searchWidth} rounded-md border border-gray-300 bg-gray-50 py-2 pr-10 pl-3 text-2xl text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500`}
          value={searchTerm}
          onChange={handleInputChange}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // Close dropdown on blur with a slight delay
          onFocus={() => searchTerm && setIsDropdownOpen(true)}
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

      {isDropdownOpen && searchResults.length > 0 && (
        <div
          className={`absolute top-14 left-0 z-20 mt-1 ${searchWidth} rounded-md bg-white shadow-lg dark:bg-gray-800`}
        >
          <ul className="max-h-60 overflow-auto focus:outline-none">
            {searchResults.map((result, index) => (
              <li
                key={index}
                className="cursor-pointer border-b border-gray-400 px-4 py-2 text-xl text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                onClick={() => handleClick(result)}
              >
                {result}
              </li>
            ))}
          </ul>
        </div>
      )}
      {isDropdownOpen && searchResults.length === 0 && searchTerm && (
        <div
          className={`absolute top-14 left-0 z-20 mt-1 ${searchWidth} rounded-md bg-white shadow-lg dark:bg-gray-800`}
        >
          <div className="px-4 py-2 text-xl text-gray-500 dark:text-gray-400">
            No results found.
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
