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
}) => (
  <MantineDatePickerInput
    label={label}
    value={value}
    onChange={(val) => onChange(val ? new Date(val) : null)}
    error={error}
    required={required}
    name={name}
    placeholder="Selecciona una fecha"
    popoverProps={{ withinPortal: true }}
    dropdownType="modal"
    valueFormat="DD/MM/YYYY"
    leftSection={leftSection}
    leftSectionPointerEvents={leftSectionPointerEvents}
  />
);

export default DatePickerInput;