import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(userLoginData: { email: $email, password: $password }) {
      message
      status
      token
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation forgotPassword($userEmail: String!) {
    forgotPassword(userEmail: $userEmail)
  }
`;

export const VERIFY_OTP = gql`
  mutation VerifyOtp($email: String!, $otp: Float!) {
    verifyOtp(verifyOtpData: { email: $email, otp: $otp }) {
      message
      status
      token
    }
  }
`;
export const RESET_PASSWORD = gql`
  mutation Resetpasssword($token: String!, $password: String!) {
    resetpasssword(resetPasswordInput: { token: $token, password: $password })
  }
`;
export const CREATE_USER = gql`
  mutation createUser(
    $first_name: String!
    $last_name: String!
    $email: String!
    $phone: String!
    $password: String!
    $role_id: Int!
  ) {
    createUser(
      createUserData: {
        first_name: $first_name
        last_name: $last_name
        email: $email
        phone: $phone
        password: $password
        role_id: $role_id
      }
    ) {
      first_name
      last_name
      email
      phone
      role_id
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser(
    $id: Float!
    $first_name: String!
    $last_name: String!
    $email: String!
    $phone: String!
    $status: Int!
  ) {
    updateUser(
      updateUserData: {
        id: $id
        first_name: $first_name
        last_name: $last_name
        email: $email
        phone: $phone
        status: $status
      }
    ) {
      id
      first_name
      last_name
      email
      phone
      status
    }
  }
`;

export const UPDATE_SITE_CONFIGURATION = gql`
  mutation updateOption($option_key: String!, $option_value: JSONObject!) {
    updateOption(
      updateOptionData: { option_key: $option_key, option_value: $option_value }
    ) {
      option_key
      option_value
    }
  }
`;

export const UPDATE_SITE_CONFIG = gql`
  mutation UpdateSiteTitleFaviconLogo(
    $optionKey: String!
    $orgTitle: String!
    $orgLogo: Upload!
    $orgFavicon: Upload!
    $companyName: String!
    $companyEmail: String!
    $companyPhone: String!
    $companyAddress: String!
  ) {
    updateSiteTitleFaviconLogo(
      siteTitleFaviconLogo: {
        option_key: $optionKey
        option_value: {
          org_title: $orgTitle
          org_logo: $orgLogo
          org_favicon: $orgFavicon
          company_name: $companyName
          company_email: $companyEmail
          company_phone: $companyPhone
          company_address: $companyAddress
        }
      }
    )
  }
`;

export const GET_DASHBOARD_DATA = gql`
  query {
    getDashboardData
  }
`;

export const UPDATE_EMAIL_TEMPLATE = gql`
  mutation UpdateEmailTemplate(
    $id: Int!
    $subject: String!
    $email_action: String!
    $content: String!
  ) {
    updateEmailTemplate(
      updateEmailTemplateData: {
        id: $id
        subject: $subject
        email_action: $email_action
        content: $content
      }
    ) {
      id
    }
  }
`;
export const CREATE_GOOGLE_AUTH_CREDENTIALS = gql`
  mutation SaveAuthCredentials($authCredentials: authCredentials!) {
    saveAuthCredentials(authCredentials: $authCredentials)
  }
`;

export const CREATE_AUTH_CODE = gql`
  mutation SaveAuthCode($authCode: authCode!) {
    saveAuthCode(authCode: $authCode) {
      status
      message
      success
    }
  }
`;

export const CREATE_SERVICES = gql`
  mutation createService(
    $name: String!
    $duration: Int!
    $fee: Float!
    $image: Upload!
    $status: String!
    $type: String
    $short_description: String!
    $availability: JSONObject!
  ) {
    createService(
      createServiceData: {
        name: $name
        duration: $duration
        fee: $fee
        image: $image
        status: $status
        type: $type
        short_description: $short_description
        availability: $availability
      }
    ) {
      success
      status
      message
    }
  }
`;

export const EDIT_SERVICES = gql`
  mutation updateService(
    $id: Int!
    $name: String!
    $duration: Int!
    $fee: Float!
    $image: Upload!
    $status: String!
    $type: String
    $short_description: String!
    $availability: JSONObject!
  ) {
    updateService(
      updateServiceData: {
        id: $id
        name: $name
        duration: $duration
        fee: $fee
        image: $image
        status: $status
        type: $type
        short_description: $short_description
        availability: $availability
      }
    ) {
      success
      status
      message
    }
  }
`;
export const UPDATE_REFUND_AMOUNT = gql`
  mutation RefundPayment($scheduleId: Int!, $amount: Float!) {
    refundPayment(schedule_id: $scheduleId, amount: $amount) {
      success
      message
      status
      data
    }
  }
`;
