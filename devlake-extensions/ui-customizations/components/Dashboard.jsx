import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Empty, Select, DatePicker, Button, Typography } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { Line, Bar } from '@ant-design/plots';
import { useCustomer } from '../components/CustomerSelector';
import dataService from '../services/dataService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const { customer } = useCustomer();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [timeRange, setTimeRange] = useState('last30days');
  const [customDateRange, setCustomDateRange] = useState(null);
  const [projectFilter, setProjectFilter] = useState('all');
  const [projects, setProjects] = useState([]);

  // Update customer context in the data service when customer changes
  useEffect(() => {
    if (customer) {
      dataService.setCustomerContext(customer);
      fetchProjects();
      fetchDashboardData();
    } else {
      setMetrics(null);
      setLoading(false);
    }
  }, [customer]);

  // Refetch data when filters change
  useEffect(() => {
    if (customer) {
      fetchDashboardData();
    }
  }, [timeRange, customDateRange, projectFilter]);

  const fetchProjects = async () => {
    try {
      const projectData = await dataService.getProjects();
      setProjects(projectData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchDashboardData = async () => {
    if (!customer) return;

    try {
      setLoading(true);

      // Prepare date parameters based on the selected time range
      let dateParams = {};
      if (timeRange === 'custom' && customDateRange) {
        dateParams = {
          startDate: customDateRange[0].format('YYYY-MM-DD'),
          endDate: customDateRange[1].format('YYYY-MM-DD'),
        };
      } else {
        // The backend would handle predefined ranges like 'last30days'
        dateParams = { timeRange };
      }

      // Add project filter if not 'all'
      const projectParam = projectFilter !== 'all' ? { projectId: projectFilter } : {};

      const metricsData = await dataService.getMetrics({
        ...dateParams,
        ...projectParam,
      });

      setMetrics(metricsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleExport = () => {
    // Implement CSV/Excel export functionality
    console.log('Export dashboard data');
  };

  // If no customer is selected, show empty state
  if (!customer) {
    return (
      <Card>
        <Empty
          description="Please select a customer to view dashboard"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>Performance Dashboard: {customer?.name}</Title>
        <div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            style={{ marginRight: 8 }}
          >
            Refresh
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Time Range:</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={timeRange}
              onChange={value => {
                setTimeRange(value);
                if (value !== 'custom') {
                  setCustomDateRange(null);
                }
              }}
              options={[
                { value: 'last7days', label: 'Last 7 days' },
                { value: 'last30days', label: 'Last 30 days' },
                { value: 'last90days', label: 'Last 90 days' },
                { value: 'thisYear', label: 'This year' },
                { value: 'custom', label: 'Custom range' },
              ]}
            />
            {timeRange === 'custom' && (
              <div style={{ marginTop: 8 }}>
                <RangePicker 
                  style={{ width: '100%' }} 
                  value={customDateRange}
                  onChange={value => setCustomDateRange(value)}
                />
              </div>
            )}
          </Col>
          <Col span={8}>
            <Text strong>Project:</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={projectFilter}
              onChange={value => setProjectFilter(value)}
              options={[
                { value: 'all', label: 'All Projects' },
                ...(projects?.map(p => ({ value: p.id, label: p.name })) || [])
              ]}
            />
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <div>
          {/* This would be replaced with actual metrics visualization once data is available */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Deployment Frequency">
                {metrics?.deploymentFrequency ? (
                  <Bar
                    data={metrics.deploymentFrequency}
                    xField="date"
                    yField="count"
                    color="#1890ff"
                    height={300}
                  />
                ) : (
                  <Empty description="No data available" />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Lead Time for Changes">
                {metrics?.leadTime ? (
                  <Line
                    data={metrics.leadTime}
                    xField="date"
                    yField="hours"
                    color="#52c41a"
                    height={300}
                  />
                ) : (
                  <Empty description="No data available" />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Change Failure Rate">
                {metrics?.changeFailureRate ? (
                  <Line
                    data={metrics.changeFailureRate}
                    xField="date"
                    yField="percentage"
                    color="#fa8c16"
                    height={300}
                  />
                ) : (
                  <Empty description="No data available" />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Time to Restore Service">
                {metrics?.timeToRestore ? (
                  <Line
                    data={metrics.timeToRestore}
                    xField="date"
                    yField="hours"
                    color="#722ed1"
                    height={300}
                  />
                ) : (
                  <Empty description="No data available" />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default Dashboard;