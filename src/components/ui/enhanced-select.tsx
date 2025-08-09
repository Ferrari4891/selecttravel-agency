import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  flag?: string;
}

interface EnhancedSelectProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  displayFormat?: (option: Option) => string;
}

export const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select option",
  className = "",
  displayFormat
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedIndex >= 0 && optionsRef.current) {
      const selectedElement = optionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        setIsOpen(true);
        setSelectedIndex(filteredOptions.findIndex(opt => opt.value === value));
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(filteredOptions.length - 1, prev + 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onValueChange(filteredOptions[selectedIndex].value);
          setIsOpen(false);
          setSearchTerm('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const navigateUp = () => {
    if (filteredOptions.length === 0) return;
    const currentIndex = filteredOptions.findIndex(opt => opt.value === value);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : filteredOptions.length - 1;
    onValueChange(filteredOptions[newIndex].value);
  };

  const navigateDown = () => {
    if (filteredOptions.length === 0) return;
    const currentIndex = filteredOptions.findIndex(opt => opt.value === value);
    const newIndex = currentIndex < filteredOptions.length - 1 ? currentIndex + 1 : 0;
    onValueChange(filteredOptions[newIndex].value);
  };

  const displayValue = selectedOption ? 
    (displayFormat ? displayFormat(selectedOption) : `${selectedOption.flag || ''} ${selectedOption.label}`) :
    placeholder;

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      <div
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="truncate">{displayValue}</span>
        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateUp();
            }}
            className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateDown();
            }}
            className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border shadow-md max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
          </div>
          <div
            ref={optionsRef}
            className="max-h-48 overflow-y-auto"
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No options found</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                    selectedIndex === index && "bg-accent text-accent-foreground",
                    value === option.value && "bg-primary/10 text-primary font-medium"
                  )}
                  onClick={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.flag && <span className="text-base">{option.flag}</span>}
                  <span className="truncate">{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};