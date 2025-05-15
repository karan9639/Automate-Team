"use client";

import { useState } from "react";
import {
  PlusIcon,
  SearchIcon,
  XIcon,
  GridIcon,
  ListIcon,
  ExternalLinkIcon,
  DotIcon as DotsVerticalIcon,
} from "lucide-react";

const LinkCard = ({ link, viewMode }) => {
  return viewMode === "grid" ? (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {link.title}
          </h3>
          <div className="relative">
            <button className="p-1 rounded-full hover:bg-gray-100">
              <DotsVerticalIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {link.description}
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {link.category}
          </span>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ExternalLinkIcon className="h-4 w-4 mr-1" />
          Visit Link
        </a>
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {link.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{link.description}</p>
            <div className="mt-2 flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {link.category}
              </span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <ExternalLinkIcon className="h-4 w-4 mr-1" />
                Visit Link
              </a>
            </div>
          </div>
          <div className="ml-4">
            <button className="p-1 rounded-full hover:bg-gray-100">
              <DotsVerticalIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Links = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Sample links data
  const [links, setLinks] = useState([
    {
      id: 1,
      title: "Company Handbook",
      description: "Official company policies and procedures",
      url: "https://example.com/handbook",
      category: "HR",
    },
    {
      id: 2,
      title: "Design System",
      description: "UI components and design guidelines",
      url: "https://example.com/design",
      category: "Design",
    },
    {
      id: 3,
      title: "API Documentation",
      description: "Reference for all API endpoints",
      url: "https://example.com/api",
      category: "Development",
    },
    {
      id: 4,
      title: "Marketing Resources",
      description: "Brand assets and marketing materials",
      url: "https://example.com/marketing",
      category: "Marketing",
    },
    {
      id: 5,
      title: "Project Roadmap",
      description: "Upcoming features and milestones",
      url: "https://example.com/roadmap",
      category: "Product",
    },
    {
      id: 6,
      title: "Team Directory",
      description: "Contact information for all team members",
      url: "https://example.com/team",
      category: "HR",
    },
  ]);

  const filteredLinks = links.filter((link) => {
    // Filter by search term
    const matchesSearch =
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.description &&
        link.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by category
    const matchesFilter =
      filter === "all" || link.category.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Get unique categories for filter dropdown
  const categories = [
    "all",
    ...new Set(links.map((link) => link.category.toLowerCase())),
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              Links
            </h1>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-2">
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm("")}
                  >
                    <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <select
                  className="block w-32 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    type="button"
                    className={`px-3 py-2 ${
                      viewMode === "grid" ? "bg-gray-100" : "bg-white"
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <GridIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 ${
                      viewMode === "list" ? "bg-gray-100" : "bg-white"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <ListIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Add Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Links grid/list */}
        <div className="p-4 sm:p-6">
          {filteredLinks.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }
            >
              {filteredLinks.map((link) => (
                <LinkCard key={link.id} link={link} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                No links found. {searchTerm && "Try a different search term."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Links;
