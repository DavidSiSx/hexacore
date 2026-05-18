"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { Loader2, Search } from "lucide-react";

interface AutocompleteSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  searchAction: (query: string) => Promise<any[]>;
  getOptionLabel?: (option: any) => string;
  getOptionValue?: (option: any) => string;
}

export default function AutocompleteSelect({
  label,
  value,
  onChange,
  placeholder = "Escribe para buscar...",
  searchAction,
  getOptionLabel = (opt) => typeof opt === "string" ? opt : opt.nombre || "",
  getOptionValue = (opt) => typeof opt === "string" ? opt : opt.nombre || "",
}: AutocompleteSelectProps) {
  const { activeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Sincronizar estado interno cuando el valor externo cambia
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Manejar búsqueda asíncrona
  useEffect(() => {
    if (!isOpen) return;

    // Si el texto es muy corto, no buscamos pero podemos sugerir el valor actual si existe
    if (inputValue.trim().length < 2) {
      setOptions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchAction(inputValue);
        setOptions(results);
        setHighlightedIndex(0);
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [inputValue, isOpen, searchAction]);

  const validateAndApply = async (currentInput: string) => {
    const trimmed = currentInput.trim();
    if (!trimmed) {
      onChange("");
      setInputValue("");
      return;
    }

    // 1. ¿Coincide exactamente con el valor original?
    if (trimmed.toLowerCase() === value.toLowerCase()) {
      setInputValue(value);
      return;
    }

    // 2. ¿Coincide con alguna opción ya cargada?
    const exactMatchInOptions = options.find(
      (opt) => getOptionValue(opt).toLowerCase() === trimmed.toLowerCase()
    );
    if (exactMatchInOptions) {
      const matchVal = getOptionValue(exactMatchInOptions);
      onChange(matchVal);
      setInputValue(matchVal);
      return;
    }

    // 3. Consulta rápida asíncrona usando searchAction
    try {
      const results = await searchAction(trimmed);
      if (results && results.length > 0) {
        const exactMatch = results.find(
          (opt) => getOptionValue(opt).toLowerCase() === trimmed.toLowerCase()
        );
        if (exactMatch) {
          const matchVal = getOptionValue(exactMatch);
          onChange(matchVal);
          setInputValue(matchVal);
          return;
        }
        
        // Auto-seleccionar primer resultado cercano
        const firstMatchVal = getOptionValue(results[0]);
        onChange(firstMatchVal);
        setInputValue(firstMatchVal);
        return;
      }
    } catch (err) {
      console.error("Error validating autocomplete value:", err);
    }

    // 4. Revertir al original
    setInputValue(value);
  };

  const stateRef = useRef({ inputValue, value, options });
  useEffect(() => {
    stateRef.current = { inputValue, value, options };
  }, [inputValue, value, options]);

  // Detectar clics fuera del componente para cerrar el dropdown y restaurar si no es válido
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const latest = stateRef.current;
        validateAndApply(latest.inputValue);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOption = (option: any) => {
    const val = getOptionValue(option);
    onChange(val);
    setInputValue(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, options.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + options.length) % Math.max(1, options.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && options[highlightedIndex]) {
        selectOption(options[highlightedIndex]);
      } else {
        validateAndApply(inputValue);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setInputValue(value);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1 w-full">
      <label className={`text-[9px] font-black uppercase tracking-wider ${activeTheme.textMutedClass} block mb-1`}>
        {label}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-[var(--background)] border-2 ${activeTheme.borderClass} px-3 py-1.5 pr-8 text-xs font-bold focus:outline-none focus:border-white transition-colors`}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
        </div>
      </div>

      {isOpen && (inputValue.trim().length >= 2 || options.length > 0) && (
        <div className={`absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto border-2 ${activeTheme.borderClass} ${activeTheme.cardBgClass} shadow-[4px_4px_0px_black]`}>
          {loading && options.length === 0 ? (
            <div className="p-3 text-xs font-bold text-center opacity-60 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando coincidencias...
            </div>
          ) : options.length === 0 ? (
            <div className="p-3 text-xs font-bold text-center opacity-60">
              No se encontraron elementos legales
            </div>
          ) : (
            options.map((option, index) => {
              const optLabel = getOptionLabel(option);
              const isSelected = getOptionValue(option) === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectOption(option)}
                  className={`w-full text-left px-3 py-2 text-xs font-black uppercase transition-colors border-b last:border-0 border-current/10 flex items-center justify-between cursor-pointer
                    ${isHighlighted ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : ""}
                    ${isSelected ? "text-[var(--accent)] font-extrabold" : ""}
                  `}
                >
                  <span>{optLabel}</span>
                  {isSelected && <span className="text-[10px] font-black">✓</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
