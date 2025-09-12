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
}) => (
  <MantineDatePickerInput
    label={label}
    value={value}
    onChange={(val) => onChange(val ? new Date(val) : null)}
    error={error}
    required={required}
    name={name}
    placeholder="Selecciona una fecha"
    popoverProps={{ withinPortal: true, zIndex: zIndex + 100 }}
    dropdownType="modal"
    modalProps={{ zIndex: zIndex + 200 }}
    valueFormat="DD/MM/YYYY"
    leftSection={leftSection}
    leftSectionPointerEvents={leftSectionPointerEvents}
  />
);

export default DatePickerInput;