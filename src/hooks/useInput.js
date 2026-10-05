import { useState } from "react";

export default function useInput(defaultValue = "") {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return [value, handleChange, setValue];
}
