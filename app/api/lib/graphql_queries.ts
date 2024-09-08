import { gql } from "@apollo/client";

export const GET_AUTHORIZATION_TOKEN = gql`
  query {
    generateAuthorizationToken {
      message
      status
      token
    }
  }
`;

export const GET_USER_DETAIL_BY_ID = gql`
  query GetUserById($id: Int!) {
    getUserById(id: $id) {
      id
      first_name
      last_name
      email
      phone
      status
      role_id
      created_at
      updated_at
    }
  }
`;
export const GET_USERS = gql`
  query {
    getUsers {
      id
      first_name
      last_name
      email
      phone
      status
      role_id
      created_at
      updated_at
    }
  }
`;
export const DELETE_BULK_USER = gql`
  query DeleteBulkUser($ids: [Int!]!) {
    deleteBulkUser(ids: $ids) {
      message
    }
  }
`;

export const GET_SITE_CONGURATION = gql`
  query {
    getOptions {
      id
      option_key
      option_value
    }
  }
`;

export const GET_ALL_SCHEDULES = gql`
  query GetAllSchedules {
    getAllSchedules {
      id
      meeting_url
      end_time
      date
      start_time
      status
      type
      user {
        email
        first_name
        last_name
        phone
      }
      service {
        name
        type
      }
    }
  }
`;
export const GET_ALL_INVOICES = gql`
  query GetOrders {
    getOrders {
      amount
      payment_date
      id
      status
      transaction_id
    }
  }
`;

export const DELETE_BULK_INVOICE = gql`
  query deleteOrder($ids: [Int!]!) {
    deleteOrder(ids: $ids) {
      message
    }
  }
`;
export const GET_EMAIL_TEMPLATES = gql`
  query {
    getEmailTemplates {
      id
      subject
      email_action
      content
    }
  }
`;

export const GET_EMAIL_TEMPLATE_DETAIL = gql`
  query getEmailTemplateByid($id: Int!) {
    getEmailTemplateByid(id: $id) {
      id
      subject
      content
      email_action
    }
  }
`;
export const GET_AVAILABILITY_BY_ID = gql`
  query GetAvailabilityById($userId: Int!) {
    getAvailabilityById(userId: $userId) {
      message
      status
      values
    }
  }
`;
export const GET_SITE_CONGURATION_BY_KEYS = gql`
  query GetOptionsByOprionkeys($optionsKeys: [String!]!) {
    getOptionsByOprionkeys(options_keys: $optionsKeys) {
      id
      option_key
      option_value
    }
  }
`;
export const GET_SERVICES = gql`
  query GetServices(
    $page: Int!
    $limit: Int!
    $search: String
    $sortBy: String
    $sortOrder: String
    $filterBy: String
    $filterValue: String
  ) {
    getServices(
      page: $page
      limit: $limit
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
      filterBy: $filterBy
      filterValue: $filterValue
    )
  }
`;
export const DELETE_BULK_SERVICES = gql`
  query DeleteService($ids: [Int!]!) {
    deleteService(ids: $ids) {
      message
    }
  }
`;
export const GET_SERVICE_DETAIL = gql`
  query GetServiceDetailsById($getServiceDetailsByIdId: Int!) {
    getServiceDetailsById(id: $getServiceDetailsByIdId)
  }
`;
export const GET_INVOICES_BY_ID = gql`
  query GetOrderDetailsById($orderId: Int!) {
    getOrderDetailsById(order_id: $orderId) {
      id
      schedule_id
      user_id
      transaction_id
      amount
      payment_date
      created_at
      updated_at
      status
      refund_id
      refund_amount
      user {
        id
        first_name
        last_name
        email
        phone
        password
        role_id
        auth_code
        is_verified
        status
        created_at
        updated_at
        is_deleted
      }
      schedule {
        id
        user_id
        date
        start_time
        end_time
        type
        status
        appreciate_id
        service_id
        parent_id
        meeting_url
        event_id
        created_at
        updated_at
        service {
          id
          name
          duration
          fee
          image
          type
          status
          short_description
          owner_id
          is_deleted
        }
      }
    }
  }
`;
