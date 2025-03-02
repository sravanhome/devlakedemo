// CustomerSelector.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Select, Button, Space, Tooltip, message } from 'antd';
import { UserOutlined, SettingsOutlined } from '@ant-design/icons';
import styled from 'styled-components';

// Create a context to share customer state throughout the app
export const CustomerContext = createContext();

export const useCustomer = () => useContext(CustomerContext);

const SelectorContainer = styled.div`
  margin-right: 20px;
  display: flex;
  align-items: center;
`;

const SelectWrapper = styled.div`
  min-width: 200px;
`;

// Main customer selector component that will be mounted in the header
const CustomerSelector = ({ onCustomerChange }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // This would be replaced with your actual API call to get customers
      // For example: const response = await fetch('/api/customers');
      
      // Mock data for demonstration
      const mockCustomers = [
        { id: 'cust-001', name: 'Acme Corporation', projects: [1, 2, 3] },
        { id: 'cust-002', name: 'Globex Industries', projects: [4, 5] }
      ];
      
      setCustomers(mockCustomers);
      
      // Set default customer from localStorage or use the first one
      const savedCustomerId = localStorage.getItem('devlake_selected_customer');
      const defaultCustomer = savedCustomerId 
        ? mockCustomers.find(c => c.id === savedCustomerId) 
        : mockCustomers[0];
      
      if (defaultCustomer) {
        setSelectedCustomer(defaultCustomer);
        handleCustomerChange(defaultCustomer);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      message.error('Failed to load customers');
      setLoading(false);
    }
  };

  const handleCustomerChange = (customer) => {
    setSelectedCustomer(customer);
    localStorage.setItem('devlake_selected_customer', customer.id);
    
    if (onCustomerChange) {
      onCustomerChange(customer);
    }
    
    // Force refresh of any data visualization components
    window.dispatchEvent(new CustomEvent('customer-changed', { detail: customer }));
    
    message.success(`Switched to ${customer.name}`);
  };

  const openCustomerSettings = () => {
    // This would open a modal or navigate to customer settings page
    message.info('Customer settings would open here');
  };

  return (
    <SelectorContainer>
      <Space>
        <SelectWrapper>
          <Select
            loading={loading}
            placeholder="Select Customer"
            value={selectedCustomer?.id}
            onChange={(value) => {
              const customer = customers.find(c => c.id === value);
              handleCustomerChange(customer);
            }}
            style={{ width: '100%' }}
            suffixIcon={<UserOutlined />}
            disabled={loading}
          >
            {customers.map(customer => (
              <Select.Option key={customer.id} value={customer.id}>
                {customer.name}
              </Select.Option>
            ))}
          </Select>
        </SelectWrapper>
        <Tooltip title="Customer Settings">
          <Button 
            icon={<SettingsOutlined />} 
            onClick={openCustomerSettings}
            disabled={!selectedCustomer}
          />
        </Tooltip>
      </Space>
    </SelectorContainer>
  );
};

// Provider component to wrap the application with customer context
export const CustomerProvider = ({ children }) => {
  const [currentCustomer, setCurrentCustomer] = useState(null);
  
  const handleCustomerChange = (customer) => {
    setCurrentCustomer(customer);
  };
  
  return (
    <CustomerContext.Provider value={{ customer: currentCustomer }}>
      <CustomerSelector onCustomerChange={handleCustomerChange} />
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerSelector;