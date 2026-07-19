import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/hooks/use-auth';

// Pages
import Login from '@/pages/Login';
import HomeownerDashboard from '@/pages/homeowner/Dashboard';
import HomeownerAnalytics from '@/pages/homeowner/Analytics';
import HomeownerRefills from '@/pages/homeowner/Refills';
import HomeownerOrder from '@/pages/homeowner/Order';
import HomeownerChat from '@/pages/homeowner/Chat';
import SetupWizard from '@/pages/homeowner/SetupWizard';
import Settings from '@/pages/Settings';

import SupplierDashboard from '@/pages/supplier/Dashboard';
import SupplierCustomers from '@/pages/supplier/Customers';
import SupplierDispatch from '@/pages/supplier/Dispatch';
import SupplierInventory from '@/pages/supplier/Inventory';
import SupplierAnalytics from '@/pages/supplier/Analytics';
import SupplierChat from '@/pages/supplier/Chat';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => null} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Login} />
      <Route path="/settings" component={Settings} />
      
      {/* Homeowner Routes */}
      <Route path="/setup" component={SetupWizard} />
      <Route path="/dashboard" component={HomeownerDashboard} />
      <Route path="/analytics" component={HomeownerAnalytics} />
      <Route path="/refills" component={HomeownerRefills} />
      <Route path="/order" component={HomeownerOrder} />
      <Route path="/chat" component={HomeownerChat} />
      
      {/* Supplier Routes */}
      <Route path="/supplier/dashboard" component={SupplierDashboard} />
      <Route path="/supplier/customers" component={SupplierCustomers} />
      <Route path="/supplier/dispatch" component={SupplierDispatch} />
      <Route path="/supplier/inventory" component={SupplierInventory} />
      <Route path="/supplier/analytics" component={SupplierAnalytics} />
      <Route path="/supplier/chat" component={SupplierChat} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;