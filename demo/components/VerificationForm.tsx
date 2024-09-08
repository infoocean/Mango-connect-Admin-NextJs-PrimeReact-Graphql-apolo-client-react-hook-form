import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";

interface VerificationField {
  label: string;
  type: string;
  name: string;
  passwordField?: boolean; // New prop to indicate whether it's a password field
  maxLength?: number;
}

interface VerificationFormProps {
  title: string;
  subTitle: string;
  onCancel: (data: any) => void;
  buttonText: string;
  onSubmit: (data: any) => void;
  fields: VerificationField[]; // Updated to use VerificationField interface
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  title,
  subTitle,
  buttonText,
  onCancel,
  onSubmit,
  fields,
}) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="borderr">
      <div className="text-center mb-2">
        {/* <img src="/demo/images/login/avatar.png" alt="Image" height="50" className="mb-3" /> */}
        <div className="text-900 text-3xl font-medium mb-3 heading">
          {title}
        </div>
        <span className="text-600 font-medium">{subTitle}</span>
      </div>
      <br />
      <br />
      <br />
      <form onSubmit={handleSubmit}>
        <div className="gridcss">
          {fields.map((field) => (
            <div
              style={{ textAlign: "left" }}
              key={field.name}
              className="verifycss"
            >
              <InputText
                placeholder={field.label}
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                maxLength={field.maxLength}
                className="verifydigit"
              />
              <br />
              <br />
            </div>
          ))}
        </div>
        <div className="gridbuttoncss">
          <Button
            className="w-full p-2 text-xl buttoncss"
            type="submit"
            label="Cancel"
          />
          &emsp;
          <Button
            className="w-full p-2 text-xl buttoncss"
            type="submit"
            label={buttonText}
          />
        </div>
      </form>
    </div>
  );
};

export default VerificationForm;
