Multi-Customer Implementation Guide for Apache DevLake
This guide describes how to implement multi-customer support in Apache DevLake, allowing you to manage multiple customers through a single UI.
Overview
The implementation consists of:

Frontend Components:

Customer selector in the application header
Customer context provider to share customer state
Customer-aware dashboard and data components


Backend Changes:

Customer data model
API controllers for customer management
Middleware for customer context
Services for customer-related operations


Database Changes:

Customers table
Customer-project associations



Implementation Steps
1. Database Setup