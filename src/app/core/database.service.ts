import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from "@angular/fire/firestore";
import { Requirement, Correlative, Product, Color, RawMaterial, Category, Unit, ProductionOrder, TicketRawMaterial, DepartureRawMaterial, Store, User, Transfer, DepartureProduct, Quotation, Document, Cash, Purchase, Provider, WholesaleCustomer, Customer, SystemActivityEvent, SalesCounter, SeparateProduct, CreditNote } from './types';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';



@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  /**
   * SYSTEM CORRELATIVES
   */
  requirementCorrelativeDocument: AngularFirestoreDocument<Correlative>;
  requirementCorrelative: Correlative = null;

  public dataRequirementCorrelative = new BehaviorSubject<Correlative>(null);
  public currentDataRequirementCorrelative = this.dataRequirementCorrelative.asObservable();

  orderCorrelativeDocument: AngularFirestoreDocument<Correlative>;
  orderCorrelative: Correlative = null;

  public dataOrderCorrelative = new BehaviorSubject<Correlative>(null);
  public currentDataOrderCorrelative = this.dataOrderCorrelative.asObservable();

  quotationsCorrelativeDocument: AngularFirestoreDocument<Correlative>;
  quotationsCorrelative: Correlative = null;

  public dataQuotationsCorrelative = new BehaviorSubject<Correlative>(null);
  public currentDataQuotationsCorrelative = this.dataQuotationsCorrelative.asObservable();

  productionOrdersCorrelativeDocument: AngularFirestoreDocument<Correlative>;
  productionOrdersCorrelative: Correlative = null;

  public dataProductionOrdersCorrelative = new BehaviorSubject<Correlative>(null);
  public currentDataProductionOrdersCorrelative = this.dataProductionOrdersCorrelative.asObservable();

  transferCorrelativeDocument: AngularFirestoreDocument<Correlative>;
  transferCorrelative: Correlative = null;

  public dataTransferCorrelative = new BehaviorSubject<Correlative>(null);
  public currentDataTransferCorrelative = this.dataTransferCorrelative.asObservable();

  /**
   * USERS
   */
  usersCollection: AngularFirestoreCollection<User>;
  users: Array<User> = [];

  public dataUsers = new BehaviorSubject<User[]>([]);
  public currentDataUsers = this.dataUsers.asObservable();

  /**
   * DOCUMENTS
   */
  documentsCollection: AngularFirestoreCollection<Document>;
  documents: Array<Document> = []

  public dataDocuments = new BehaviorSubject<Document[]>([]);
  public currentDataDocuments = this.dataDocuments.asObservable();

  /**
   * ORDERS
   */
  ordersCollection: AngularFirestoreCollection<Requirement>;
  orders: Array<Requirement> = []

  public dataOrders = new BehaviorSubject<Requirement[]>([]);
  public currentDataOrders = this.dataOrders.asObservable();

  /**
   * REQUIREMENTS
   */
  requirementsCollection: AngularFirestoreCollection<Requirement>;
  requirements: Array<Requirement> = [];

  public dataRequirements = new BehaviorSubject<Requirement[]>([]);
  public currentDataRequirements = this.dataRequirements.asObservable();

  /**
   * QUOTATIONS
   */
  quotationsCollection: AngularFirestoreCollection<Quotation>;
  quotations: Array<Quotation> = [];

  public dataQuotations = new BehaviorSubject<Quotation[]>([]);
  public currentDataQuotations = this.dataQuotations.asObservable();

  /**
   * PRODUCTION ORDERS
   */
  productionOrdersCollection: AngularFirestoreCollection<ProductionOrder>;
  productionOrders: Array<ProductionOrder> = []

  public dataProductionOrders = new BehaviorSubject<ProductionOrder[]>([]);
  public currentDataProductionOrders = this.dataProductionOrders.asObservable();

  /**
   * QUOTATIONS TO BE REFERENCED
   */
  quotationsToReferenceCollection: AngularFirestoreCollection<Quotation>;
  quotationsToReference: Array<Quotation> = []

  public dataQuotationsToReference = new BehaviorSubject<Quotation[]>([]);
  public currentDataQuotationsToReference = this.dataQuotationsToReference.asObservable();

  /**
   * PRODUCTS
   */
  finishedProductsCollection: AngularFirestoreCollection<Product>;
  finishedProducts: Array<Product> = [];

  public dataFinishedProducts = new BehaviorSubject<Product[]>([]);
  public currentDataFinishedProducts = this.dataFinishedProducts.asObservable();

  /**
   * RAW MATERIAL
   */
  rawMaterialsCollection: AngularFirestoreCollection<RawMaterial>;
  rawMaterials: Array<RawMaterial> = [];

  public dataRawMaterials = new BehaviorSubject<RawMaterial[]>([]);
  public currentDataRawMaterials = this.dataRawMaterials.asObservable();

  /**
   * COLORS
   */
  colorsCollection: AngularFirestoreCollection<Color>;
  colors: Array<Color> = [];

  public dataColors = new BehaviorSubject<Color[]>([]);
  public currentDataColors = this.dataColors.asObservable();

  /**
   * CATEGORIES
   */
  categoriesCollection: AngularFirestoreCollection<Category>;
  categories: Array<Category> = [];

  public dataCategories = new BehaviorSubject<Category[]>([]);
  public currentDataCategories = this.dataCategories.asObservable();

  /**
   * UNITS
   */
  unitsCollection: AngularFirestoreCollection<Unit>;
  units: Array<Unit> = [];

  public dataUnits = new BehaviorSubject<Unit[]>([]);
  public currentDataUnits = this.dataUnits.asObservable();


  /**
   * STORES
   */
  storesCollection: AngularFirestoreCollection<Store>;
  stores: Array<Store> = [];

  public dataStores = new BehaviorSubject<Store[]>([]);
  public currentDataStores = this.dataStores.asObservable();

  /**
   * TICKETS
   */
  ticketsCollection: AngularFirestoreCollection<TicketRawMaterial>;
  tickets: Array<TicketRawMaterial> = [];

  public dataTickets = new BehaviorSubject<TicketRawMaterial[]>([]);
  public currentDataTickets = this.dataTickets.asObservable();

  /**
   * DEPARTURES
   */
  departuresCollection: AngularFirestoreCollection<DepartureRawMaterial | DepartureProduct>;
  departures: Array<DepartureRawMaterial | DepartureProduct> = [];

  public dataDepartures = new BehaviorSubject<(DepartureRawMaterial | DepartureProduct)[]>([]);
  public currentDataDepartures = this.dataDepartures.asObservable();

  /**
   * TRANSFERS
   */
  transfersCollection: AngularFirestoreCollection<Transfer>;
  transfers: Array<Transfer> = [];

  public dataTransfers = new BehaviorSubject<Transfer[]>([]);
  public currentDataTransfers = this.dataTransfers.asObservable();

  /**
   * RECEPTIONS
   */
  receptionsCollection: AngularFirestoreCollection<Transfer>;
  receptions: Array<Transfer> = [];

  public dataReceptions = new BehaviorSubject<Transfer[]>([]);
  public currentDataReceptions = this.dataReceptions.asObservable();

  /**
   * CASH LIST
   */
  cashListCollection: AngularFirestoreCollection<Cash>;
  cashList: Array<Cash> = [];

  public dataCashList = new BehaviorSubject<Cash[]>([]);
  public currentDataCashList = this.dataCashList.asObservable();

  /**
   * PURCHASES
   */
  purchasesCollection: AngularFirestoreCollection<Purchase>;
  purchases: Array<Purchase> = [];

  public dataPurchases = new BehaviorSubject<Purchase[]>([]);
  public currentDataPurchases = this.dataPurchases.asObservable();

  /**
   * DEBTSTOPAY
   */
  debtsToPayCollection: AngularFirestoreCollection<Purchase>;
  debtsToPay: Array<Purchase> = [];

  public dataDebtsToPay = new BehaviorSubject<Purchase[]>([]);
  public currentDataDebtsToPay = this.dataDebtsToPay.asObservable();

  /**
   * CREDIT NOTES
   */
  creditNotesCollection: AngularFirestoreCollection<CreditNote>;
  creditNotes: Array<CreditNote> = [];

  public dataCreditNotes = new BehaviorSubject<CreditNote[]>([]);
  public currentDataCreditNotes = this.dataCreditNotes.asObservable();


  /**
   * PROVIDERS
   */
  providersCollection: AngularFirestoreCollection<Provider>;
  providers: Array<Provider> = [];

  public dataProviders = new BehaviorSubject<Provider[]>([]);
  public currentDataProviders = this.dataProviders.asObservable();

  /**
   * WHOLESALE CUSTOMER
   */
  wholesaleCollection: AngularFirestoreCollection<WholesaleCustomer>;
  wholesale: Array<WholesaleCustomer> = [];

  public dataWholesale = new BehaviorSubject<WholesaleCustomer[]>([]);
  public currentDataWholesale = this.dataWholesale.asObservable();

  /**
   * CUSTOMERS
   */
  customersCollection: AngularFirestoreCollection<Customer>;
  customers: Array<Customer> = [];

  public dataCustomers = new BehaviorSubject<Customer[]>([]);
  public currentDataCustomers = this.dataCustomers.asObservable();

  /**
   * SEPARATE PRODUCTS
   */
  separateProductsCollection: AngularFirestoreCollection<SeparateProduct>;
  separateProducts: Array<SeparateProduct> = [];

  public dataSeparateProducts = new BehaviorSubject<SeparateProduct[]>([]);
  public currentDataSeparateProducts = this.dataSeparateProducts.asObservable();

  /**
   * RELEASE NOTES
   */
  releaseNotesDocument: AngularFirestoreDocument<any>;
  releaseNotes: any = '';

  public dataReleaseNotes = new BehaviorSubject<any>('');
  public currentDataReleaseNotes = this.dataReleaseNotes.asObservable();

  /**
   * SYSTEM ACTIVITY LOGS
   */
  systemActivityLogsCollection: AngularFirestoreCollection<SystemActivityEvent>;
  systemActivityLogs: Array<SystemActivityEvent> = [];

  public dataSystemActivityLogs = new BehaviorSubject<SystemActivityEvent[]>([]);
  public currentDataSystemActivityLogs = this.dataSystemActivityLogs.asObservable();

  /**
   * SYSTEM ACTIVITY SALES COUNTERS
   */

  systemActivityCounterSalesDocument: AngularFirestoreDocument<SalesCounter>;
  systemActivityCounterSales: SalesCounter = null;

  public dataSystemActivityCounterSales = new BehaviorSubject<SalesCounter>(null);
  public currentDataSystemActivityCounterSales = this.dataSystemActivityCounterSales.asObservable();



  constructor(
    public af: AngularFirestore,
    public auth: AuthService
  ) {

    let date = new Date();
    let fromMonth = date.getMonth();
    let fromYear = date.getFullYear();

    /**MONTH */

    let from = new Date(fromYear, fromMonth, 1).valueOf();

    let toMonth = (fromMonth + 1) % 12;
    let toYear = fromYear;

    if (fromMonth + 1 >= 13) {
      toYear++;
    }

    let to = new Date(toYear, toMonth, 1).valueOf();

    /**DAY */

    let fromDay = new Date(fromYear, fromMonth, date.getDate()).getTime();
    let toDay = fromDay + 86400000;

    this.auth.currentDataPermit.subscribe(res => {
      if (res.name) {
        this.getReleaseNotes();
        this.getUsers();
        this.getDocuments();
        this.getRequirements(from, to);
        this.getRequirementsCorrelative();
        this.getOrders(from, to);
        this.getQuotationsToReference();
        this.getOrdersCorrelative();
        this.getQuotations(from, to);
        this.getQuotationsCorrelative();
        this.getStores();
        this.getSeparateProducts();
        this.getRawMaterials();
        this.getCategories();
        this.getUnits();
        this.getProductionOrders(from, to);
        this.getProductionOrdersCorrelative();
        this.getTickets(from, to);
        this.getDepartures(from, to);
        this.getFinishedProducts();
        this.getTransfers(from, to);
        this.getTransfersCorrelative();
        this.getReceptions(from, to);
        this.getCashList();
        this.getDebtsToPay();
        this.getPurchases(from, to);
        this.getCreditNotes(fromDay, toDay);
        this.getProviders();
        this.getWholesaleCustomers();
        this.getCustomers();

        this.getSystemActivityLogs(fromDay, toDay);
        this.getSystemActivityCounterSales();
      }
    })

  }

  getReleaseNotes(): void {
    this.releaseNotesDocument = this.af.doc(`db/${this.auth.userInteriores.db}/releaseNotes/current`);
    this.releaseNotesDocument.valueChanges()
      .subscribe(res => {
        if (res) {
          this.releaseNotes = res;
          this.dataReleaseNotes.next(res);
        }
      })
  }

  getUsers(): void {
    this.usersCollection = this.af.collection(`users`, ref => ref.orderBy('regDate', 'desc'));
    this.usersCollection.valueChanges()
      .pipe(
        map(res => {
          let filteredUsers: Array<User> = [];

          res.forEach((element, index) => {
            element['index'] = index;
            if (element.db === this.auth.userInteriores.db) {
              filteredUsers.push(element);
            }
          });

          return filteredUsers;
        })
      )
      .subscribe(res => {
        this.users = res;
        this.dataUsers.next(res);
      })
  }

  getDocuments(): void {
    this.documentsCollection = this.af.collection(`db/${this.auth.userInteriores.db}/documents`, ref => ref.orderBy('name', 'desc'));
    this.documentsCollection.valueChanges()
      .pipe(
        map(res => {
          res.forEach((element, index) => {
            element['index'] = index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.documents = res;
        this.dataDocuments.next(res);
      })
  }

  // *************************************** SALES ********************************************

  /**
   * @desc Function to get the requirements coleection from firestore
   * @param all {boolean} flag to get all or a range of requirements based in date
   * @param from {number} time in milliseconds
   * @param to {number} time in milliseconds
   */
  getRequirements(from?: number, to?: number): void {
    this.requirementsCollection = this.af.collection(`db/${this.auth.userInteriores.db}/requirements`, ref => ref.where('regDate', '>=', from).where('regDate', '<=', to));

    this.requirementsCollection.valueChanges()
      .pipe(
        map(res => {
          try {
            let filteredList = [];

            res.forEach((element, index) => {
              element['index'] = index;
              if ((this.auth.userInteriores.uid === element.createdByUid) && !this.auth.permit.requirementsCompleteList) {
                filteredList.push(element);
              }
            });

            if (this.auth.permit.requirementsCompleteList) {
              return res;
            } else {
              return filteredList;
            }
          } catch (error) {
            console.log('getRequirements', error)
          }
        }),
        map(res => {
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        })
      )
      .subscribe(res => {
        this.requirements = res;
        this.dataRequirements.next(res);
      })
  }

  getOrders(from?: number, to?: number): void {
    this.ordersCollection = this.af.collection(`db/${this.auth.userInteriores.db}/orders`, ref => ref.where('regDate', '>=', from).where('regDate', '<=', to));

    this.ordersCollection.valueChanges()
      .pipe(
        map(res => {
          try {
            let filteredList = [];

            res.forEach((element, index) => {
              element['index'] = index;
              if ((this.auth.userInteriores.uid === element.createdByUid) && !this.auth.permit.ordersCompleteList) {
                filteredList.push(element);
              }
            });

            if (this.auth.permit.ordersCompleteList) {
              return res;
            } else {
              return filteredList;
            }
          } catch (error) {
            console.log('getOrders', error)
          }
        }),
        map(res => {
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        })
      )
      .subscribe(res => {
        this.orders = res;
        this.dataOrders.next(res);
      })
  }

  getQuotationsToReference(): void {
    this.quotationsToReferenceCollection = this.af.collection<Quotation>(`db/${this.auth.userInteriores.db}/quotations`, ref => ref.where('status', '==', 'Respondida'));

    this.quotationsToReferenceCollection.valueChanges()
      .subscribe(res => {
        this.quotationsToReference = res;
        this.dataQuotationsToReference.next(res);
      });
  }

  getQuotations(from?: number, to?: number): void {
    this.quotationsCollection = this.af.collection(`db/${this.auth.userInteriores.db}/quotations`, ref => ref.where('regDate', '>=', from).where('regDate', '<=', to));

    this.quotationsCollection.valueChanges()
      .pipe(
        map(res => {
          try {
            let filteredList = [];

            res.forEach((element, index) => {
              element['index'] = index;
              if ((this.auth.userInteriores.uid === element.createdByUid) && !this.auth.permit.quotationsCompleteList) {
                filteredList.push(element);
              }
            });

            if (this.auth.permit.quotationsCompleteList) {
              return res;
            } else {
              return filteredList;
            }
          } catch (error) {
            console.log('getQuotations', error)
          }
        }),
        map(res => {
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        })
      )
      .subscribe(res => {
        this.quotations = res;
        this.dataQuotations.next(res);
      })
  }

  getRequirementsCorrelative(): void {
    this.requirementCorrelativeDocument = this.af.doc(`db/${this.auth.userInteriores.db}/correlatives/OR`);
    this.requirementCorrelativeDocument.valueChanges()
      .subscribe(res => {
        this.requirementCorrelative = res;
        this.dataRequirementCorrelative.next(res);
      })
  }

  getOrdersCorrelative(): void {
    this.orderCorrelativeDocument = this.af.doc(`db/${this.auth.userInteriores.db}/correlatives/OPe`);
    this.orderCorrelativeDocument.valueChanges()
      .subscribe(res => {
        this.orderCorrelative = res;
        this.dataOrderCorrelative.next(res);
      })
  }

  getQuotationsCorrelative(): void {
    this.quotationsCorrelativeDocument = this.af.doc(`db/${this.auth.userInteriores.db}/correlatives/COT`);
    this.quotationsCorrelativeDocument.valueChanges()
      .subscribe(res => {
        this.quotationsCorrelative = res;
        this.dataQuotationsCorrelative.next(res);
      })
  }

  getStores(): void {
    this.storesCollection = this.af.collection(`db/${this.auth.userInteriores.db}/stores`, ref => ref.orderBy('regDate', 'desc'));
    this.storesCollection.valueChanges()
      .pipe(
        map(res => {
          res.forEach((element, index) => {
            element['index'] = index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.stores = res;
        this.dataStores.next(res);
      });
  }

  getSeparateProducts(): void {
    this.separateProductsCollection = this.af.collection(`db/${this.auth.userInteriores.db}/separateProducts`);
    this.separateProductsCollection.valueChanges()
      .pipe(
        map(res => {
          // order result from newer to oldest
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        }),
        map(res => {
          // adding inverse index number, first item will have
          // the total lenght number of the array.
          res.forEach((element, index) => {
            element['index'] = res.length - index;
          });
          return res;
        })
      )
      .subscribe(res => {
        if (res) {
          this.separateProducts = res;
          this.dataSeparateProducts.next(res);
        }
      })
  }

  // *************************************** PRODUCTION *****************************************

  getRawMaterials(): void {
    this.rawMaterialsCollection = this.af.collection(`db/${this.auth.userInteriores.db}/rawMaterials`, ref => ref.orderBy('regDate', 'desc'));
    this.rawMaterialsCollection.valueChanges()
      .pipe(
        map(res => {
          res.forEach((element, index) => {
            element['index'] = index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.rawMaterials = res;
        this.dataRawMaterials.next(res);
      })
  }

  getCategories(): void {
    this.categoriesCollection = this.af.collection(`db/${this.auth.userInteriores.db}/categories`);
    this.categoriesCollection.valueChanges()
      .subscribe(res => {
        this.categories = res;
        this.dataCategories.next(res);
      })
  }

  getUnits(): void {
    this.unitsCollection = this.af.collection(`db/${this.auth.userInteriores.db}/units`);
    this.unitsCollection.valueChanges()
      .subscribe(res => {
        this.units = res;
        this.dataUnits.next(res);
      })
  }

  getProductionOrders(from?: number, to?: number): void {

    this.productionOrdersCollection = this.af.collection(`db/${this.auth.userInteriores.db}/productionOrders`, ref => ref.where('regDate', '>=', from).where('regDate', '<=', to));


    this.productionOrdersCollection.valueChanges()
      .pipe(
        map(res => {
          res.forEach((element, index) => {
            element['index'] = index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.productionOrders = res;
        this.dataProductionOrders.next(res);
      })
  }

  getProductionOrdersCorrelative(): void {
    this.productionOrdersCorrelativeDocument = this.af.doc(`db/${this.auth.userInteriores.db}/correlatives/OP`);
    this.productionOrdersCorrelativeDocument.valueChanges()
      .subscribe(res => {
        this.productionOrdersCorrelative = res;
        this.dataProductionOrdersCorrelative.next(res);
      })
  }

  getTickets(from?: number, to?: number): void {
    this.ticketsCollection = this.af.collection(`db/${this.auth.userInteriores.db}/tickets`, ref => ref.where('regDate', '>=', from).where('regDate', '<=', to));

    this.ticketsCollection.valueChanges()
      .pipe(
        map(res => {
          res.forEach((element, index) => {
            element['index'] = index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.tickets = res;
        this.dataTickets.next(res);
      })
  }

  getDepartures(from?: number, to?: number): void {
    this.departuresCollection = this.af.collection(`db/${this.auth.userInteriores.db}/departures`, ref => ref.where('regDate', '>=', from).where('regDate', '<=', to));

    this.departuresCollection.valueChanges()
      .pipe(
        map(res => {
          res.forEach((element, index) => {
            element['index'] = index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.departures = res;
        this.dataDepartures.next(res);
      })
  }

  getFinishedProducts(): void {
    this.finishedProductsCollection = this.af.collection(`db/${this.auth.userInteriores.db}/finishedProducts`, ref => ref.orderBy('regDate', 'desc'));
    this.finishedProductsCollection.valueChanges()
      .pipe(
        map(res => {
          res.forEach((element, index) => {
            element['index'] = index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.finishedProducts = res;
        this.dataFinishedProducts.next(res);
      });
  }

  /***************************LOGISTIC ********************************** */
  getTransfers(from: number, to: number): void {
    this.transfersCollection = this.af.collection<Transfer>(`db/${this.auth.userInteriores.db}/transfers`, ref => ref.where('regDate', '>=', from).where('regDate', '<=', to));
    this.transfersCollection.valueChanges()
      .pipe(
        map(res => {
          try {
            let filteredTransfers = [];

            res.forEach((element, index) => {
              element['index'] = index;
              if ((this.auth.userInteriores.uid === element.destination.supervisor.uid || this.auth.userInteriores.uid === element.createdByUid) && !this.auth.permit.logisticTransfersCompleteList) {
                filteredTransfers.push(element);
              }
            });

            if (this.auth.permit.logisticTransfersCompleteList) {
              return res;
            } else {
              return filteredTransfers;
            }
          } catch (error) {
            console.log('getTransfers', error);
          }
        }),
        map(res => {
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        })
      )
      .subscribe(res => {
        this.transfers = res;
        this.dataTransfers.next(res);
      })
  }

  getTransfersCorrelative(): void {
    this.transferCorrelativeDocument = this.af.doc(`db/${this.auth.userInteriores.db}/correlatives/TR`);
    this.transferCorrelativeDocument.valueChanges()
      .subscribe(res => {
        this.transferCorrelative = res;
        this.dataTransferCorrelative.next(res);
      })
  }

  getReceptions(from: number, to: number): void {
    this.receptionsCollection = this.af.collection(`db/${this.auth.userInteriores.db}/transfers`, ref => ref.where('regDate', '>=', from).where('regDate', '<=', to));
    this.receptionsCollection
      .valueChanges()
      .pipe(
        map(res => {
          try {
            let filteredList: Array<Transfer> = [];

            res.forEach((element, index) => {
              element['index'] = index;
              if ((this.auth.userInteriores.uid === element.destination.supervisor.uid || this.auth.userInteriores.uid === element.createdByUid) && !this.auth.permit.logisticTransfersCompleteList) {
                filteredList.push(element);
              }
            });

            if (this.auth.permit.logisticTransfersCompleteList) {
              return res;
            } else {
              return filteredList;
            }
          } catch (error) {
            console.log('getReceptions', error)
          }
        }),
        map(res => {
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        })
      )
      .subscribe(res => {
        this.receptions = res;
        this.dataReceptions.next(res);
      })
  }

  // ******************** CASH ****************
  getCashList(): void {
    this.cashListCollection = this.af.collection(`db/${this.auth.userInteriores.db}/cashList`, ref => ref.orderBy('location.name', 'asc'));
    this.cashListCollection.valueChanges()
      .pipe(
        map(res => {
          res.forEach((element, index) => {
            element['index'] = index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.cashList = res;
        this.dataCashList.next(res);
      });
  }

  getDebtsToPay(): void {
    this.debtsToPayCollection = this.af.collection(`db/${this.auth.userInteriores.db}/purchases`, ref => ref.where('status', '==', 'Pendiente'));
    this.debtsToPayCollection.valueChanges()
      .pipe(
        map(res => {
          res.forEach((element, index) => {
            element['index'] = index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.debtsToPay = res;
        this.dataDebtsToPay.next(res);
      });
  }

  getCreditNotes(from: number, to: number): void {
    this.creditNotesCollection = this.af.collection(`db/${this.auth.userInteriores.db}/creditNotes`, ref => ref.where('regDate', '>=', from).where('regDate', '<=', to));
    this.creditNotesCollection.valueChanges()
      .pipe(
        map(res => {
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        }),
        map(res => {
          res.forEach((element, index) => {
            element['index'] = res.length - index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.creditNotes = res;
        this.dataCreditNotes.next(res);
      });
  }


  // ***************************** PURCHASES *******************
  getPurchases(from: number, to: number): void {
    this.purchasesCollection = this.af.collection(`db/${this.auth.userInteriores.db}/purchases`, ref => ref.where('regDate', '>=', from).where('regDate', '<=', to));
    this.purchasesCollection
      .valueChanges()
      .pipe(
        map(res => {
          // order result from newer to oldest
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        }),
        map(res => {
          // adding inverse index number, first item will have
          // the total lenght number of the array.
          res.forEach((element, index) => {
            element['index'] = res.length - index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.purchases = res;
        this.dataPurchases.next(res);
      })
  }


  // ***************************** THIRD PARTIES *******************
  getProviders(): void {
    this.providersCollection = this.af.collection(`db/${this.auth.userInteriores.db}/providers`);
    this.providersCollection
      .valueChanges()
      .pipe(
        map(res => {
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        }),
        map(res => {
          res.forEach((element, index) => {
            element['index'] = res.length - index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.providers = res;
        this.dataProviders.next(res);
      })
  }

  getWholesaleCustomers(): void {
    this.wholesaleCollection = this.af.collection(`db/${this.auth.userInteriores.db}/wholesale`);
    this.wholesaleCollection
      .valueChanges()
      .pipe(
        map(res => {
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        }),
        map(res => {
          res.forEach((element, index) => {
            element['index'] = res.length - index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.wholesale = res;
        this.dataWholesale.next(res);
      })
  }

  getCustomers(): void {
    this.customersCollection = this.af.collection(`db/${this.auth.userInteriores.db}/customers`);
    this.customersCollection
      .valueChanges()
      .pipe(
        map(res => {
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        }),
        map(res => {
          res.forEach((element, index) => {
            element['index'] = res.length - index;
          });
          return res;
        })
      )
      .subscribe(res => {
        this.customers = res;
        this.dataCustomers.next(res);
      })
  }

  /************************************ REPORTS ********************************/

  getSystemActivityLogs(from: number, to: number): void {
    this.systemActivityLogsCollection = this.af.collection(`db/${this.auth.userInteriores.db}/systemActivityLogs`, ref => ref.where('regDate', '>=', from).where('regDate', '<=', to));
    this.systemActivityLogsCollection.valueChanges()
      .pipe(
        map(res => {
          return res.sort((a, b) => b['regDate'] - a['regDate']);
        }),
        map(res => {
          res.forEach((element, index) => {
            element['index'] = res.length - index;
          });
          return res;
        })
      )
      .subscribe(res => {
        if (res) {
          this.systemActivityLogs = res;
          this.dataSystemActivityLogs.next(res);
        }
      })
  }

  getSystemActivityCounterSales(): void {
    this.systemActivityCounterSalesDocument = this.af.doc(`db/${this.auth.userInteriores.db}/systemActivityCounters/sales`);
    this.systemActivityCounterSalesDocument.valueChanges()
      .subscribe(res => {
        this.systemActivityCounterSales = res;
        this.dataSystemActivityCounterSales.next(res);
      })
  }

}
