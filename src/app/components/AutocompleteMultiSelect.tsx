"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Search, Loader2 } from "lucide-react";

interface AutocompleteMultiSelectProps {
  label: string;
  placeholder: string;
  selected: string[];
  onChange: (items: string[]) => void;
  onSearch: (query: string) => Promise<any[]>;
  themeColor?: string; // e.g. "bg-emerald-500", "bg-purple-500", etc.
  t: {
    noResults: string;
    loading: string;
    add: string;
    alreadySelected?: string;
  };
}

export default function AutocompleteMultiSelect({
  label,
  placeholder,
  selected,
  onChange,
  onSearch,
  themeColor = "bg-amber-400",
  t,
}: AutocompleteMultiSelectProps) {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstMount = useRef(true);

  // Client-side hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search logic
  useEffect(() => {
    if (!mounted) return;
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const trimmed = inputValue.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await onSearch(trimmed);
        setSuggestions(results);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [inputValue, onSearch, mounted]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setInputValue("");
        setSuggestions([]);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBlur = (e: React.FocusEvent) => {
    // If relatedTarget is null, let handleClickOutside handle the mouse click.
    if (e.relatedTarget === null) return;

    // If the new focused element is not within our container (e.g. Tab navigation to another field),
    // close the dropdown and clear any temporary unsubmitted input text.
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
      setInputValue("");
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  if (!mounted) {
    // Skeleton loading state during hydration
    return (
      <div className="mb-4">
        <label className="block text-sm font-bold uppercase tracking-wider mb-2 text-neutral-300">
          {label}
        </label>
        <div className="h-10 bg-neutral-800 border-2 border-black animate-pulse rounded-none" />
      </div>
    );
  }

  const handleSelect = (item: any) => {
    // Suggestions could return objects or strings
    const itemName = typeof item === "string" ? item : (item.nombre || item.name || "");
    if (!itemName) return;

    if (!selected.includes(itemName)) {
      onChange([...selected, itemName]);
    }
    setInputValue("");
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemove = (itemName: string) => {
    onChange(selected.filter((i) => i !== itemName));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Always prevent form submission on Enter to block bubbling to the parent form!
    if (e.key === "Enter") {
      e.preventDefault();
      
      if (isOpen) {
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelect(suggestions[activeIndex]);
        } else {
          // If no active index is selected, check for an exact match or single suggestion
          const trimmedInput = inputValue.trim().toLowerCase();
          if (trimmedInput.length >= 2) {
            const exactMatch = suggestions.find((item) => {
              const name = typeof item === "string" ? item : (item.nombre || item.name || "");
              return name.toLowerCase() === trimmedInput;
            });

            if (exactMatch) {
              handleSelect(exactMatch);
            } else if (suggestions.length === 1) {
              handleSelect(suggestions[0]);
            } else {
              // Clear input value to prevent arbitrary unselected typing
              setInputValue("");
              setSuggestions([]);
              setIsOpen(false);
            }
          } else {
            setInputValue("");
            setSuggestions([]);
            setIsOpen(false);
          }
        }
      }
      return;
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
        e.preventDefault();
        break;
      case "ArrowUp":
        setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        e.preventDefault();
        break;
      case "Escape":
        setIsOpen(false);
        setInputValue("");
        setSuggestions([]);
        setActiveIndex(-1);
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  return (
    <div className="mb-5 relative" ref={containerRef}>
      <label className="block text-xs font-black uppercase tracking-wider mb-2 text-neutral-200">
        {label}
      </label>

      {/* Selected Tags Display */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((item) => (
            <span
              key={item}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold text-black border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${themeColor} transition-transform hover:-translate-y-0.5`}
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="hover:bg-black hover:text-white rounded-none p-0.5 transition-colors focus:outline-none"
                aria-label={`Remove ${item}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-neutral-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-neutral-900 border-2 border-black text-neutral-100 placeholder-neutral-500 pl-10 pr-4 py-2.5 text-sm font-semibold rounded-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        />
      </div>

      {/* Dropdown suggestions */}
      {isOpen && inputValue.trim().length >= 2 && (
        <div className="absolute z-[999] w-full mt-2 bg-neutral-950 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto rounded-none">
          {isLoading && suggestions.length === 0 ? (
            <div className="p-3 text-sm text-neutral-400 font-medium italic flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              {t.loading}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-3 text-sm text-neutral-500 font-bold italic">
              {t.noResults}
            </div>
          ) : (
            <ul role="listbox" className="py-1">
              {suggestions.map((item, index) => {
                const itemName = typeof item === "string" ? item : (item.nombre || item.name || "");
                const isAlreadySelected = selected.includes(itemName);

                return (
                  <li
                    key={itemName || index}
                    role="option"
                    aria-selected={activeIndex === index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!isAlreadySelected) {
                        handleSelect(item);
                      }
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer border-b border-neutral-900 last:border-b-0 transition-colors ${
                      activeIndex === index
                        ? `${themeColor} text-black font-extrabold`
                        : isAlreadySelected
                        ? "bg-neutral-900/50 text-neutral-500 cursor-not-allowed font-medium"
                        : "text-neutral-200 hover:bg-neutral-900 font-semibold"
                    }`}
                  >
                    <span>{itemName}</span>
                    {isAlreadySelected && (
                      <span className="text-xs uppercase font-extrabold tracking-wider bg-neutral-800 text-neutral-400 px-2 py-0.5">
                        {t.alreadySelected || "Selected"}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
