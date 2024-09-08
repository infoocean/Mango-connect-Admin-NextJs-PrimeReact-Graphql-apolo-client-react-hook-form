import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Avatar } from "primereact/avatar";
import { Checkbox } from "primereact/checkbox";
import { InputMask } from "primereact/inputmask";
import Link from "next/link";
import { ProgressSpinner } from "primereact/progressspinner";

interface AuthField {
  label: string;
  type: string;
  name: string;
  passwordField?: boolean; // New prop to indicate whether it's a password field
  screenLock?: boolean;
  digit?: boolean;
}

interface AuthFormProps {
  title: string;
  subTitle: string;
  onCancel: (data: any) => void;
  buttonText: string;
  onSubmit: (data: any) => void;
  fields: AuthField[]; // Updated to use AuthField interface
  loading: boolean; // New prop to indicate loading state
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subTitle,
  buttonText,
  onCancel,
  onSubmit,
  fields,
  loading,
}) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [checked, setChecked] = useState(false);

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
        {fields.map((field) => (
          <div style={{ textAlign: "left" }} key={field.name}>
            {field.screenLock === true && field.passwordField === true ? (
              <div className="profilecss">
                {" "}
                <br />
                <Avatar
                  image="https://apollo.primereact.org/layout/images/avatar/avatar.png"
                  size="xlarge"
                  shape="circle"
                />
                <p>Isabella Andolini</p>
                <br />
                <span className="p-float-label">
                  <Password
                    placeholder={field.label}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    toggleMask
                    className="w-full mb-2"
                    inputClassName="w-full p-3 md:w-30rem"
                  />
                  <label className="labelcss" htmlFor={field.label}>
                    {" "}
                    {field.label}
                  </label>
                </span>
              </div>
            ) : field.passwordField ? (
              <>
                <span className="p-float-label">
                  <Password
                    placeholder={field.label}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    // className="passwordWidth"
                    className="w-full mb-2"
                    inputClassName="w-full p-3 md:w-30rem"
                    toggleMask
                  />
                  <label className="labelcss" htmlFor={field.label}>
                    {" "}
                    {field.label}
                  </label>
                </span>
              </>
            ) : field.digit ? (
              <>
                <span className="p-float-label">
                  <InputMask
                    id="phone"
                    mask="999-999-9999"
                    name={field.name}
                    placeholder="999-999-9999"
                    value={formData[field.name] || ""}
                    onChange={(e: any) => handleChange(e)}
                    className="w-full md:w-30rem mb-2"
                    style={{ padding: "1rem" }}
                  ></InputMask>
                  <label className="labelcss" htmlFor={field.label}>
                    {" "}
                    {field.label}
                  </label>
                </span>
              </>
            ) : (
              <>
                <span className="p-float-label">
                  <InputText
                    placeholder={field.label}
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    className="w-full md:w-30rem mb-2"
                    style={{ padding: "1rem" }}
                  />
                  <label className="labelcss" htmlFor={field.label}>
                    {" "}
                    {field.label}
                  </label>
                </span>
              </>
            )}
            <br />
            <br />
          </div>
        ))}
        {buttonText === "Login" ? (
          <div className="flex align-items-center justify-content-between mb-2 gap-5">
            <div className="flex align-items-center">
              <Checkbox
                inputId="rememberme1"
                checked={checked}
                onChange={(e) => setChecked(e.checked ?? false)}
                className="mr-2"
              ></Checkbox>
              <label htmlFor="rememberme1">Remember me</label>
            </div>
            <Link
              href="/forgot_password"
              className="font-medium no-underline ml-2 text-right cursor-pointer"
              style={{ color: "var(--primary-color)" }}
            >
              Forgot password?
            </Link>
          </div>
        ) : (
          ""
        )}
        {loading ? (
          <Button
            label={"Loading..."}
            className="w-full p-3 text-xl buttoncss"
            type="submit"
          ></Button>
        ) : (
          <Button
            label={buttonText}
            className="w-full p-3 text-xl buttoncss"
            type="submit"
          ></Button>
        )}
      </form>
    </div>
  );
};

export default AuthForm;
