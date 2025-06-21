"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, RotateCcw, Trash2, UserX } from "lucide-react";

const ActionDropdown = ({
  onReassignTasks,
  onDeleteTasks,
  onDeleteMember,
  memberName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Calculate position
      let top = rect.bottom + scrollY + 4;
      let left = rect.right + scrollX - 192; // 192px is the width of dropdown (w-48)

      // Check if dropdown would go off-screen and adjust
      const dropdownWidth = 192;
      const dropdownHeight = 140; // Approximate height

      // Adjust horizontal position if it goes off-screen
      if (left < scrollX + 8) {
        left = scrollX + 8;
      } else if (left + dropdownWidth > window.innerWidth + scrollX - 8) {
        left = rect.left + scrollX - dropdownWidth + rect.width;
      }

      // Adjust vertical position if it goes off-screen
      if (top + dropdownHeight > window.innerHeight + scrollY - 8) {
        top = rect.top + scrollY - dropdownHeight - 4;
      }

      setDropdownPosition({ top, left });
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  const handleAction = (action) => {
    action();
    setIsOpen(false);
  };

  const DropdownContent = () => (
    <div
      ref={dropdownRef}
      className="fixed w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 z-[9999]"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
      }}
    >
      <div className="py-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAction(onReassignTasks);
          }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <RotateCcw size={16} />
          Reassign All Tasks
        </button>

        {/* <button
          onClick={(e) => {
            e.stopPropagation();
            handleAction(onDeleteTasks);
          }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
        >
          <Trash2 size={16} />
          Delete All Tasks
        </button> */}

        <div className="border-t dark:border-gray-700 my-1"></div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAction(onDeleteMember);
          }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
        >
          <UserX size={16} />
          Delete Member
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={`Actions for ${memberName}`}
      >
        <MoreVertical size={18} className="text-gray-600 dark:text-gray-400" />
      </button>

      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(<DropdownContent />, document.body)}
    </>
  );
};

export default ActionDropdown;
