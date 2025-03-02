import { message } from 'antd';

// Base API URL for Apache DevLake
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/rest';

/**
 * Data service that includes customer context in all API requests
 */
class DataService {
  constructor() {
    this.currentCustomer = null;
  }

  /**
   * Set the current customer context
   * @param {Object} customer The current customer object
   */
  setCustomerContext(customer) {
    this.currentCustomer = customer;
    console.log(`Data service now using customer context: ${customer?.name}`);
  }

  /**
   * Get customer-specific request headers
   * @returns {Object} Headers with customer context
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add customer context header if a customer is selected
    if (this.currentCustomer) {
      headers['X-Customer-ID'] = this.currentCustomer.id;
    }

    return headers;
  }

  /**
   * Apply customer context to URL if needed
   * @param {string} url The API endpoint
   * @returns {string} URL with customer context if applicable
   */
  getContextualUrl(url) {
    // For endpoints that need customer context in the URL
    if (this.currentCustomer && !url.includes('customer=')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}customer=${this.currentCustomer.id}`;
    }
    return url;
  }

  /**
   * Make an API request with customer context
   * @param {string} endpoint The API endpoint
   * @param {Object} options Fetch options
   * @returns {Promise} Response promise
   */
  async request(endpoint, options = {}) {
    try {
      const url = this.getContextualUrl(`${API_BASE_URL}${endpoint}`);
      
      const requestOptions = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      };

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      message.error(`Failed to fetch data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch projects filtered by current customer
   * @returns {Promise<Array>} List of projects
   */
  async getProjects() {
    if (!this.currentCustomer) {
      message.warning('Please select a customer first');
      return [];
    }

    // In a production environment, you would filter by customer on the server-side
    // For the POC, we'll filter client-side using the list of projects associated with the customer
    const allProjects = await this.request('/projects');
    
    return allProjects.filter(project => 
      this.currentCustomer.projects.includes(project.id)
    );
  }

  /**
   * Fetch dashboard data for the current customer
   * @param {string} dashboardId The dashboard ID
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardData(dashboardId) {
    if (!this.currentCustomer) {
      message.warning('Please select a customer first');
      return null;
    }
    
    return this.request(`/dashboards/${dashboardId}/data`);
  }

  /**
   * Fetch metrics for the current customer
   * @param {Object} params Query parameters
   * @returns {Promise<Object>} Metrics data
   */
  async getMetrics(params = {}) {
    if (!this.currentCustomer) {
      message.warning('Please select a customer first');
      return null;
    }
    
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/metrics?${queryString}`);
  }

  /**
   * Create a new connection for the current customer
   * @param {Object} connectionData Connection configuration
   * @returns {Promise<Object>} Created connection
   */
  async createConnection(connectionData) {
    if (!this.currentCustomer) {
      message.warning('Please select a customer first');
      return null;
    }
    
    return this.request('/connections', {
      method: 'POST',
      body: JSON.stringify({
        ...connectionData,
        customerId: this.currentCustomer.id
      })
    });
  }
}

// Create a singleton instance
const dataService = new DataService();

export default dataService;