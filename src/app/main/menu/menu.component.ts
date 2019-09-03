import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd, NavigationStart } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Permit } from 'src/app/core/types';
import { distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { MenuShowReleaseNotesDialogComponent } from './menu-show-release-notes-dialog/menu-show-release-notes-dialog.component';
import { DatabaseService } from 'src/app/core/database.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styles: []
})
export class MenuComponent implements OnInit, OnDestroy {

  deviceFormat: string = 'web';

  openedMenu: boolean = false;
  openedNotifications: boolean = false;
  salesOpenedFlag: boolean = false;
  productionOpenedFlag: boolean = false;
  logisticOpenedFlag: boolean = false;
  cashOpenedFlag: boolean = false;
  thirdPartiesOpenedFlag: boolean = false;
  reportsOpenedFlag: boolean = false;
  configurationsOpenedFlag: boolean = false;


  loadingRouteConfig: boolean;

  selectedTab = new FormControl(0);

  buttonOptions = {
    sales: {
      requirements: false,
      orders: false,
      quotations: false,
      sales: false,
      stores: false,
      checkStock: false,
      separateProducts: false,
      history: false
    },
    production: {
      requirements: false,
      orders: false,
      production: false,
      quotations: false,
      materials: false,
      finishedProducts: false
    },
    logistic: {
      transfers: false,
      receptions: false
    },
    cash: {
      actual: false,
      previous: false,
      manage: false,
      debtsToPay: false
    },
    purchases: {
      registerDocuments: false,
    },
    thirdParties: {
      wholesale: false,
      providers: false,
      customers: false
    },
    reports: {
      systemStats: false,
      systemActivity: false,
      sales: false,
      cash: false,
      production: false
    },
    configurations: {
      accounts: false,
      permits: false
    }

  }

  permits: Permit =
    {
      id: '',
      name: '',
      salesSection: false,
      salesRequirementsButton: false,
      requirementsCompleteList: false,
      salesOrdersButton: false,
      ordersCompleteList: false,
      salesQuotationsButton: false,
      quotationsCompleteList: false,
      salesShoppingButton: false,
      salesStoresButton: false,
      salesCheckStockButton: false,
      salesSeparateProductsButton: false,
      salesSeparateProductsSellAction: false,
      salesSeparateProductsCancelAction: false,
      salesSeparateProductsChangeSerialAction: false,
      salesHistoryButton: false,
      productionSection: false,
      productionRequirementsButton: false,
      productionOrdersButton: false,
      productionProductionOrdersButton: false,
      productionQuotationsButton: false,
      productionRawMaterialsButton: false,
      productionFinishedProductsButton: false,
      productionFinishedProductsTableSale: false,
      logisticSection: false,
      logisticTransfersButton: false,
      logisticTransfersCompleteList: false,
      logisticReceptionsButton: false,
      cashSection: false,
      cashActualButton: false,
      cashPreviousButton: false,
      cashManageButton: false,
      cashTransactionApproveAction: false,
      cashTransactionEditAction: false,
      cashTransactionCancelAction: false,
      cashActualOpeningBalanceAction: false,
      cashActualOpeningDateAction: false,
      cashActualPrintAction: false,
      cashActualExportAction: false,
      cashManageSettingsAction: false,
      cashManageReportsAction: false,
      cashManageEditAction: false,
      cashManageDeleteAction: false,
      cashManageCreateButton: false,
      cashDebtsToPayButton: false,
      cashDebtsToPayPayAction: false,
      purchasesSection: false,
      purchasesRegisterDocumentsButton: false,
      purchasesRegisterDocumentsCreateButton: false,
      purchasesVerifyAction: false,
      purchasesEditAction: false,
      purchasesDeleteAction: false,
      thirdPartiesSection: false,
      thirdPartiesWholesaleButton: false,
      thirdPartiesProvidersButton: false,
      thirdPartiesCustomersButton: false,
      reportsSection: false,
      reportsSystemStatsButton: false,
      reportsSystemActivityButton: false,
      reportsSalesButton: false,
      reportsCashButton: false,
      reportsProductionButton: false,
      configurationsSection: false,
      configurationsAccountsButton: false,
      configurationsPermitsButton: false,
      regDate: 0
    };

  subscriptions: Array<Subscription> = [];

  constructor(
    breakpointObserver: BreakpointObserver,
    private router: Router,
    public auth: AuthService,
    public dbs: DatabaseService,
    private dialog: MatDialog
  ) {
    breakpointObserver.observe([
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait,
    ]).subscribe(res => {
      if (res.matches) {
        this.deviceFormat = 'mobile';
      }
    });

    breakpointObserver.observe([
      Breakpoints.WebPortrait,
      Breakpoints.WebLandscape,
    ]).subscribe(res => {
      if (res.matches) {
        this.deviceFormat = 'web';
      }
    });

    breakpointObserver.observe([
      Breakpoints.TabletPortrait,
    ]).subscribe(res => {
      if (res.matches) {
        this.deviceFormat = 'tablet';
      }
    });
  }

  ngOnInit() {

    const permit$ =
      this.auth.currentDataPermit.subscribe(res => {
        if (res.name) {
          this.permits = res;
          this.checkRoute(this.router.url);

          this.dbs.currentDataReleaseNotes
            .subscribe(res => {
              if (res) {
                if (res.value !== this.auth.userInteriores.releaseNotesSeen) {
                  this.openReleaseNotes();
                }
              }
            });
        }
      });

    this.subscriptions.push(permit$);

    this.router.events
      .subscribe(event => {
        if (event instanceof RouteConfigLoadStart) {
          this.loadingRouteConfig = true;
        } else if (event instanceof RouteConfigLoadEnd) {
          this.loadingRouteConfig = false;
        } else if (event instanceof NavigationStart) {

          if (event.url !== '/main') {
            this.auth.saveLastRoute(event.url);
            this.checkRoute(event.url);
          }

        }
      });

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cleanButtons(): void {
    this.buttonOptions = {
      sales: {
        requirements: false,
        orders: false,
        quotations: false,
        sales: false,
        stores: false,
        checkStock: false,
        separateProducts: false,
        history: false
      },
      production: {
        requirements: false,
        orders: false,
        production: false,
        quotations: false,
        materials: false,
        finishedProducts: false
      },
      logistic: {
        transfers: false,
        receptions: false
      },
      cash: {
        actual: false,
        previous: false,
        manage: false,
        debtsToPay: false
      },
      purchases: {
        registerDocuments: false
      },
      thirdParties: {
        wholesale: false,
        providers: false,
        customers: false
      },
      reports: {
        systemStats: false,
        systemActivity: false,
        sales: false,
        cash: false,
        production: false
      },
      configurations: {
        accounts: false,
        permits: false
      }
    }
  }

  toggleSideMenu(): void {
    this.openedMenu = !this.openedMenu;
  }

  toggleSideNotifications(): void {
    this.openedNotifications = !this.openedNotifications
  }

  salesOpened(): void {
    this.salesOpenedFlag = true;
  }

  salesClosed(): void {
    this.salesOpenedFlag = false;
  }

  productionOpened(): void {
    this.productionOpenedFlag = true;
  }

  productionClosed(): void {
    this.productionOpenedFlag = false;
  }

  logisticOpened(): void {
    this.logisticOpenedFlag = true;
  }

  logisticClosed(): void {
    this.logisticOpenedFlag = false;
  }

  cashOpened(): void {
    this.cashOpenedFlag = true;
  }

  cashClosed(): void {
    this.cashOpenedFlag = false;
  }

  thirdPartiesOpened(): void {
    this.thirdPartiesOpenedFlag = true;
  }

  thirdPartiesClosed(): void {
    this.thirdPartiesOpenedFlag = false;
  }

  reportsOpened(): void {
    this.reportsOpenedFlag = true;
  }

  reportsClosed(): void {
    this.reportsOpenedFlag = false;
  }

  configurationsOpened(): void {
    this.configurationsOpenedFlag = true;
  }

  configurationsClosed(): void {
    this.configurationsOpenedFlag = false;
  }

  checkRoute(route: string): void {
    let coincidence = false;

    if (this.permits.salesSection) {
      switch (route) {
        case '/main/sales/requirements/form':
          this.selectedTab.setValue(0);
          this.cleanButtons();
          this.buttonOptions.sales.requirements = true;
          coincidence = true;
          break;

        case '/main/sales/requirements/list':
          this.selectedTab.setValue(0);
          this.cleanButtons();
          this.buttonOptions.sales.requirements = true;
          coincidence = true;
          break;

        case '/main/sales/quotations':
          this.selectedTab.setValue(0);
          this.cleanButtons();
          this.buttonOptions.sales.quotations = true;
          coincidence = true;
          break;

        case '/main/sales/orders/form':
          this.selectedTab.setValue(0);
          this.cleanButtons();
          this.buttonOptions.sales.orders = true;
          coincidence = true;
          break;

        case '/main/sales/orders/list':
          this.selectedTab.setValue(0);
          this.cleanButtons();
          this.buttonOptions.sales.orders = true;
          coincidence = true;
          break;

        case '/main/sales/sales':
          this.selectedTab.setValue(0);
          this.cleanButtons();
          this.buttonOptions.sales.sales = true;
          coincidence = true;
          break;

        case '/main/sales/check-stock':
          this.selectedTab.setValue(0);
          this.cleanButtons();
          this.buttonOptions.sales.checkStock = true;
          coincidence = true;
          break;

        case '/main/sales/stores':
          this.selectedTab.setValue(0);
          this.cleanButtons();
          this.buttonOptions.sales.stores = true;
          coincidence = true;
          break;

        case '/main/sales/separate-products':
          this.selectedTab.setValue(0);
          this.cleanButtons();
          this.buttonOptions.sales.separateProducts = true;
          coincidence = true;
          break;

        case '/main/sales/history':
          this.selectedTab.setValue(0);
          this.cleanButtons();
          this.buttonOptions.sales.history = true;
          coincidence = true;
          break;
      }
    }

    if (this.permits.productionSection) {
      switch (route) {
        case '/main/production/requirements':
          this.selectedTab.setValue(1);
          this.cleanButtons();
          this.buttonOptions.production.requirements = true;
          coincidence = true;
          break;

        case '/main/production/orders':
          this.selectedTab.setValue(1);
          this.cleanButtons();
          this.buttonOptions.production.orders = true;
          coincidence = true;
          break;

        case '/main/production/production':
          this.selectedTab.setValue(1);
          this.cleanButtons();
          this.buttonOptions.production.production = true;
          coincidence = true;
          break;

        case '/main/production/quotations':
          this.selectedTab.setValue(1);
          this.cleanButtons();
          this.buttonOptions.production.quotations = true;
          coincidence = true;
          break;

        case '/main/production/raw-material':
          this.selectedTab.setValue(1);
          this.cleanButtons();
          this.buttonOptions.production.materials = true;
          coincidence = true;
          break;

        case '/main/production/finished-products':
          this.selectedTab.setValue(1);
          this.cleanButtons();
          this.buttonOptions.production.finishedProducts = true;
          coincidence = true;
          break;
      }
    }

    if (this.permits.logisticSection) {
      switch (route) {
        case '/main/logistic/transfers':
          this.selectedTab.setValue(2);
          this.cleanButtons();
          this.buttonOptions.logistic.transfers = true;
          coincidence = true;
          break;

        case '/main/logistic/receptions':
          this.selectedTab.setValue(2);
          this.cleanButtons();
          this.buttonOptions.logistic.receptions = true;
          coincidence = true;
          break;
      }
    }

    if (this.permits.cashSection) {
      switch (route) {
        case '/main/cash/actual':
          this.selectedTab.setValue(3);
          this.cleanButtons();
          this.buttonOptions.cash.actual = true;
          coincidence = true;
          break;

        case '/main/cash/debts-to-pay':
          this.selectedTab.setValue(3);
          this.cleanButtons();
          this.buttonOptions.cash.debtsToPay = true;
          coincidence = true;
          break;

        case '/main/cash/manage':
          this.selectedTab.setValue(3);
          this.cleanButtons();
          this.buttonOptions.cash.manage = true;
          coincidence = true;
          break;
      }
    }

    if (this.permits.purchasesSection) {
      switch (route) {
        case '/main/purchases/register-documents':
          this.selectedTab.setValue(4);
          this.cleanButtons();
          this.buttonOptions.purchases.registerDocuments = true;
          coincidence = true;
          break;
      }
    }

    if (this.permits.thirdPartiesSection) {
      switch (route) {
        case '/main/third-parties/wholesale':
          this.selectedTab.setValue(5);
          this.cleanButtons();
          this.buttonOptions.thirdParties.wholesale = true;
          coincidence = true;
          break;
        case '/main/third-parties/providers':
          this.selectedTab.setValue(5);
          this.cleanButtons();
          this.buttonOptions.thirdParties.providers = true;
          coincidence = true;
          break;
        case '/main/third-parties/customers':
          this.selectedTab.setValue(5);
          this.cleanButtons();
          this.buttonOptions.thirdParties.customers = true;
          coincidence = true;
          break;
      }
    }

    if (this.permits.reportsSection) {
      switch (route) {
        case '/main/reports/system-stats':
          this.selectedTab.setValue(6);
          this.cleanButtons();
          this.buttonOptions.reports.systemStats = true;
          coincidence = true;
          break;
        case '/main/reports/system-activity':
          this.selectedTab.setValue(6);
          this.cleanButtons();
          this.buttonOptions.reports.systemActivity = true;
          coincidence = true;
          break;
        case '/main/reports/sales':
          this.selectedTab.setValue(6);
          this.cleanButtons();
          this.buttonOptions.reports.sales = true;
          coincidence = true;
          break;
        case '/main/reports/cash':
          this.selectedTab.setValue(6);
          this.cleanButtons();
          this.buttonOptions.reports.cash = true;
          coincidence = true;
          break;
        case '/main/reports/production':
          this.selectedTab.setValue(6);
          this.cleanButtons();
          this.buttonOptions.reports.production = true;
          coincidence = true;
          break;
      }
    }

    if (this.permits.configurationsSection) {
      switch (route) {
        case '/main/configurations/accounts':
          this.selectedTab.setValue(7);
          this.cleanButtons();
          this.buttonOptions.configurations.accounts = true;
          coincidence = true;
          break;
        case '/main/configurations/permits':
          this.selectedTab.setValue(7);
          this.cleanButtons();
          this.buttonOptions.configurations.permits = true;
          coincidence = true;
          break;
      }
    }

    if (!coincidence) {
      this.selectedTab.setValue(0);
      this.router.navigate(['/main']);
    }
  }

  openReleaseNotes(): void {
    this.dialog.open(MenuShowReleaseNotesDialogComponent)
      .afterClosed().subscribe(res => {
        this.dbs.usersCollection
          .doc(this.auth.userInteriores.uid)
          .update({ releaseNotesSeen: this.dbs.releaseNotes.value })
      });
  }

}
