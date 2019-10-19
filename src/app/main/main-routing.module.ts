import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./dashboard/dashboard.module').then(mod => mod.DashboardModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(mod => mod.DashboardModule)
      },
      {
        path: 'configurations/permits',
        loadChildren: () => import('./configurations/configurations-permits/configurations-permits.module').then(mod => mod.ConfigurationsPermitsModule)
      },
      {
        path: 'sales/requirements',
        loadChildren: () => import('./sales/requirements/requirements.module').then(mod => mod.RequirementsModule)
      },
      {
        path: 'sales/orders',
        loadChildren: () => import('./sales/orders/orders.module').then(mod => mod.OrdersModule)
      },
      {
        path: 'sales/quotations',
        loadChildren: () => import('./sales/quotations/quotations.module').then(mod => mod.QuotationsModule)
      },
      {
        path: 'sales/shopping',
        loadChildren: () => import('./sales/shopping/shopping.module').then(mod => mod.ShoppingModule)
      },
      {
        path: 'sales/check-stock',
        loadChildren: () => import('./sales/check-stock/check-stock.module').then(mod => mod.CheckStockModule)
      },
      {
        path: 'sales/stores',
        loadChildren: () => import('./sales/stores/stores.module').then(mod => mod.StoresModule)
      },
      // {
      //   path: 'sales/separate-products',
      //   loadChildren: () => import('./sales/separate-products/separate-products.module').then(mod => mod.SeparateProductsModule)
      // },
      {
        path: 'sales/history',
        loadChildren: () => import('./sales/sales-history/sales-history.module').then(mod => mod.SalesHistoryModule)
      },
      {
        path: 'production/requirements',
        loadChildren: () => import('./production/prod-requirements/prod-requirements.module').then(mod => mod.ProdRequirementsModule)
      },
      {
        path: 'production/orders',
        loadChildren: () => import('./production/prod-orders/prod-orders.module').then(mod => mod.ProdOrdersModule)
      },
      {
        path: 'production/raw-material',
        loadChildren: () => import('./production/raw-material/raw-material.module').then(mod => mod.RawMaterialModule)
      },
      {
        path: 'production/production',
        loadChildren: () => import('./production/production-list/production-list.module').then(mod => mod.ProductionListModule)
      },
      {
        path: 'production/quotations',
        loadChildren: () => import('./production/prod-quotations/prod-quotations.module').then(mod => mod.ProdQuotationsModule)
      },
      {
        path: 'production/finished-products',
        loadChildren: () => import('./production/finished-products/finished-products.module').then(mod => mod.FinishedProductsModule)
      },
      {
        path: 'logistic/transfers',
        loadChildren: () => import('./logistic/transfers/transfers.module').then(mod => mod.TransfersModule)
      },
      {
        path: 'logistic/receptions',
        loadChildren: () => import('./logistic/receptions/receptions.module').then(mod => mod.ReceptionsModule)
      },
      {
        path: 'cash/actual',
        loadChildren: () => import('./cash/actual-cash/actual-cash.module').then(mod => mod.ActualCashModule)
      },
      {
        path: 'cash/debts-to-pay',
        loadChildren: () => import('./cash/debts-to-pay/debts-to-pay.module').then(mod => mod.DebtsToPayModule)
      },
      {
        path: 'cash/manage',
        loadChildren: () => import('./cash/manage-cash/manage-cash.module').then(mod => mod.ManageCashModule)
      },
      {
        path: 'purchases/register-documents',
        loadChildren: () => import('./purchases/register-documents/register-documents.module').then(mod => mod.RegisterDocumentsModule)
      },
      {
        path: 'third-parties/wholesale',
        loadChildren: () => import('./third-parties/third-parties-wholesale/third-parties-wholesale.module').then(mod => mod.ThirdPartiesWholesaleModule)
      },
      {
        path: 'third-parties/providers',
        loadChildren: () => import('./third-parties/third-parties-providers/third-parties-providers.module').then(mod => mod.ThirdPartiesProvidersModule)
      },
      {
        path: 'third-parties/customers',
        loadChildren: () => import('./third-parties/third-parties-customers/third-parties-customers.module').then(mod => mod.ThirdPartiesCustomersModule)
      },
      {
        path: 'reports/system-stats',
        loadChildren: () => import('./reports/reports-system-stats/reports-system-stats.module').then(mod => mod.ReportsSystemStatsModule)
      },
      {
        path: 'reports/system-activity',
        loadChildren: () => import('./reports/reports-system-activity/reports-system-activity.module').then(mod => mod.ReportsSystemActivityModule)
      },
      {
        path: 'reports/sales',
        loadChildren: () => import('./reports/reports-sales/reports-sales.module').then(mod => mod.ReportsSalesModule)
      },
      {
        path: 'reports/cash',
        loadChildren: () => import('./reports/reports-cash/reports-cash.module').then(mod => mod.ReportsCashModule)
      },
      {
        path: 'reports/production',
        loadChildren: () => import('./reports/reports-production/reports-production.module').then(mod => mod.ReportsProductionModule)
      },
      {
        path: 'configurations/accounts',
        loadChildren: () => import('./configurations/configurations-accounts/configurations-accounts.module').then(mod => mod.ConfigurationsAccountsModule)
      },
      {
        path: 'configurations/permits',
        loadChildren: () => import('./configurations/configurations-permits/configurations-permits.module').then(mod => mod.ConfigurationsPermitsModule)
      },
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
