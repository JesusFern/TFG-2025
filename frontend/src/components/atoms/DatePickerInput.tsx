import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../styles/DatePickerInput.module.css";

interface DatePickerInputProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  required?: boolean;
  name?: string;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  name,
}) => (
  <div className={styles.container}>
    {label && (
      <label className={styles.label}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </label>
    )}
    <ReactDatePicker
      selected={value}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      className={styles.input}
      placeholderText="Selecciona una fecha"
      name={name}
      required={required}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
    />
    {error && <div className={styles.error}>{error}</div>}
  </div>
);

export default DatePickerInput;