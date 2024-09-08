import * as Yup from "yup";
const emailRules =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
const numberrules = /^(0|[1-9]\d*)$/;
const digitrules = /^[0-9]$/;
const stringrules = /^[A-Za-z ]*$/;
const passwordrules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

export const loginFormvalidation = Yup.object().shape({
  email: Yup.string()
    .required("Email is a required field *")
    .matches(emailRules, "Please Enter a valid email address *")
    .email("Please Enter a valid email *"),
  password: Yup.string().required("Password is a required field *"),
});

export const profileFormvalidation = Yup.object().shape({
  first_name: Yup.string()
    .required("First name field is required *")
    .min(3, "First name must be at least 3 characters *")
    .matches(stringrules, "Please enter valid name *"),
  last_name: Yup.string()
    .required("Last name field is required **")
    .min(3, "Last name must be at least 3 characters *")
    .matches(stringrules, "Please enter valid name *"),
  email: Yup.string()
    .required("Email is a required field *")
    .matches(emailRules, "Please Enter a valid email address *")
    .email("Please Enter a valid email address *"),
  phone: Yup.string()
    .required("Number field is required **")
    .matches(numberrules, "Please Enter a valid number *")
    .min(10, "Number must be 10 digit *")
    .max(10, "Number must be 10 digit *"),
});

export const forgotPasswordFormvalidation = Yup.object().shape({
  email: Yup.string()
    .required("Email is a required field *")
    .matches(emailRules, "Please Enter a valid email address *")
    .email("Please Enter a valid email *"),
});

export const resetPasswordFormValidation = Yup.object().shape({
  password: Yup.string()
    .required("Password is a required field *")
    .matches(
      passwordrules,
      "Password must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character *"
    ),
  confirmpassword: Yup.string()
    .required("Confirm Password is a required field *")
    .oneOf(
      [Yup.ref("password")],
      "Password and confirm password are not match *"
    ),
});

export const usersFormvalidation = Yup.object().shape({
  first_name: Yup.string()
    .required("First name field is required *")
    .min(3, "First name must be at least 3 characters *")
    .matches(stringrules, "Please enter valid name *"),
  last_name: Yup.string()
    .required("Last name field is required **")
    .min(3, "Last name must be at least 3 characters *")
    .matches(stringrules, "Please enter valid name *"),
  email: Yup.string()
    .required("Email is a required field *")
    .matches(emailRules, "Please Enter a valid email address *")
    .email("Please Enter a valid email address *"),
  phone: Yup.string()
    .required("Number field is required **")
    .matches(numberrules, "Please Enter a valid number *")
    .min(10, "Number must be 10 digit *")
    .max(10, "Number must be 10 digit *"),
  // role_id: Yup.string()
  //   .required("Role Id is required")
  //   .matches(numberrules, "Please enter a valid role_id") // Assuming 'numberrules' is a regex pattern for validating numbers
  //   .test("valid-role-id", "Role Id must be between 1 and 9", (value) => {
  //     const roleId = parseInt(value);
  //     return roleId >= 1 && roleId <= 9;
  //   })
  //   .max(1, "Role Id must be a single character"),
});

export const siteConfigurationFormvalidation = Yup.object().shape({
  stripe_pk: Yup.string().required("Primary Key is a required *"),
  stripe_sk: Yup.string().required("Secret Key is a required *"),
  org_title: Yup.string().required("Title is a required *"),

  company_name: Yup.string().required("Company name is a required *"),
  company_email: Yup.string()
    .required("Company email is a required field *")
    .matches(emailRules, "Please Enter a valid email address *")
    .email("Please Enter a valid email address *"),
  company_phone: Yup.string()
    .required(" Phone Number field is required **")
    .matches(numberrules, "Please Enter a valid  phone number *")
    .min(10, " Phone Number must be 10 digit *")
    .max(10, " Phone Number must be 10 digit *"),
  company_address: Yup.string().required("Company address is a required *"),

  duration: Yup.string()
    .required("Time duration is a required *")
    .matches(numberrules, "Please Enter a valid number *"),
  amount: Yup.string()
    .required("Amount is a required *")
    .matches(numberrules, "Please Enter a valid number *"),
});

export const emailSubject = Yup.object().shape({
  subject: Yup.string().required("Subject field is required *"),
});

export const integrations = Yup.object().shape({
  client_id: Yup.string().required("client_id is required *"),
  // project_id: Yup.string().required("project_id is required *"),
  // auth_uri: Yup.string().required("auth_uri is required *"),
  api_key: Yup.string().required("api_key is required *"),
  // auth_provider: Yup.string().required("auth_provider is required *"),
  client_secret: Yup.string().required("client_secret is required *"),
  calender_id: Yup.string().required("calender_id is required *"),
});

export const stripeFormvalidation = Yup.object().shape({
  stripe_pk: Yup.string().required("Primary Key is a required *"),
  stripe_sk: Yup.string().required("Secret Key is a required *"),
});

export const serviceValidation = Yup.object().shape({
  name: Yup.string().required("Service name is a required *"),
  description: Yup.string().required("Short description is a required *"),
  duration: Yup.string()
    .required("Time duration is a required *")
    .matches(numberrules, "Please Enter a valid number *"),
  fee: Yup.string()
    .required("Price is a required *")
    .matches(numberrules, "Please Enter a valid number *"),
  status: Yup.string().required("Status field is a required *"),
  type: Yup.string().required("Type field is a required *"),
});
export const editserviceValidation = Yup.object().shape({
  name: Yup.string().required("Service name is a required *"),
  description: Yup.string().required("Short description is a required *"),
  duration: Yup.string()
    .required("Time duration is a required *")
    .matches(numberrules, "Please Enter a valid number *"),
  fee: Yup.string()
    .required("Price is a required *")
    .matches(numberrules, "Please Enter a valid number *"),
});
export const refundValidation = (maxAmount: any) =>
  Yup.object().shape({
    amount: Yup.string()
      .required("Amount is a required *")
      .matches(numberrules, "Please Enter a valid number *")
      .test(
        "maxAmount",
        `You cannot enter an amount more than $${maxAmount}`,
        (value) => !value || parseFloat(value) <= maxAmount
      ),
  });
