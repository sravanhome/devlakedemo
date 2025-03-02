import React from 'react';
import { Layout, Menu } from 'antd';
import { CustomerProvider } from './components/CustomerSelector';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import ProjectsPage from './pages/Projects';
import ConfigurationPage from './pages/Configuration';

const { Header, Content, Sider } = Layout;

const AppLayout = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="logo" style={{ color: 'white', fontSize: '1.5em' }}>
            Apache DevLake
          </div>
          {/* Add the CustomerProvider to wrap the entire app */}
          <CustomerProvider />
        </Header>
        <Layout>
          <Sider width={200} className="site-layout-background">
            <Menu
              mode="inline"
              defaultSelectedKeys={['dashboard']}
              style={{ height: '100%', borderRight: 0 }}
            >
              <Menu.Item key="dashboard">Dashboard</Menu.Item>
              <Menu.Item key="projects">Projects</Menu.Item>
              <Menu.Item key="connections">Connections</Menu.Item>
              <Menu.Item key="blueprints">Blueprints</Menu.Item>
              <Menu.Item key="configuration">Configuration</Menu.Item>
            </Menu>
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Content
              className="site-layout-background"
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/configuration" element={<ConfigurationPage />} />
                {/* Add other routes here */}
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
};

export default AppLayout;
