import React from "react";
import { DatePickerInput as MantineDatePickerInput } from "@mantine/dates";

interface DatePickerInputProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  required?: boolean;
  name?: string;
  leftSection?: React.ReactNode;
  leftSectionPointerEvents?: "none" | "auto";
  zIndex?: number;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  name,
  leftSection,
  leftSectionPointerEvents,
  zIndex = 1000,
  placeholder,
  disabled,
  clearable,
  minDate,
  maxDate,
}) => (
  <MantineDatePickerInput
    label={label}
    value={value}
    onChange={(val) => onChange(val ? new Date(val) : null)}
    error={error}
    required={required}
    name={name}
    placeholder={placeholder || "Selecciona una fecha"}
    popoverProps={{ withinPortal: true, zIndex: zIndex + 100 }}
    dropdownType="modal"
    modalProps={{ zIndex: zIndex + 200 }}
    valueFormat="DD/MM/YYYY"
    leftSection={leftSection}
    leftSectionPointerEvents={leftSectionPointerEvents}
    disabled={disabled}
    clearable={clearable}
    minDate={minDate}
    maxDate={maxDate}
  />
);

export default DatePickerInput;