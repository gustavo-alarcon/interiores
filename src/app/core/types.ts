export interface User {
    uid: string;
    name: string;
    lastname: string;
    displayName: string;
    lastRoute: string;
    currentCash: CurrentCash | null;
    password: string;
    permitId: string;
    db: string;
    releaseNotesSeen: string;
    regDate: number;
}

export interface Permit {
    id: string;
    name: string;
    salesSection: boolean;
    salesRequirementsButton: boolean;
    requirementsCompleteList: boolean;
    salesOrdersButton: boolean;
    ordersCompleteList: boolean;
    salesQuotationsButton: boolean;
    quotationsCompleteList: boolean;
    salesShoppingButton: boolean;
    salesStoresButton: boolean;
    salesCheckStockButton: boolean;
    salesSeparateProductsButton: boolean;
    salesSeparateProductsSellAction: boolean;
    salesSeparateProductsCancelAction: boolean;
    salesSeparateProductsChangeSerialAction: boolean;
    salesHistoryButton: boolean;
    salesHistoryUserFilter: boolean;
    productionSection: boolean;
    productionRequirementsButton: boolean;
    productionOrdersButton: boolean;
    productionProductionOrdersButton: boolean;
    productionQuotationsButton: boolean;
    productionRawMaterialsButton: boolean;
    productionRawMaterialsCreateButton: boolean;
    productionRawMaterialsSubstractAction: boolean;
    productionRawMaterialsEditAction: boolean;
    productionRawMaterialsDeleteAction: boolean;
    productionFinishedProductsButton: boolean;
    productionFinishedProductsCreateButton: boolean;
    productionFinishedProductsTableSale: boolean;
    productionFinishedProductsEditAction: boolean;
    productionFinishedProductsDeleteAction: boolean;
    logisticSection: boolean;
    logisticTransfersButton: boolean;
    logisticTransfersCompleteList: boolean;
    logisticReceptionsButton: boolean;
    cashSection: boolean;
    cashActualButton: boolean;
    cashPreviousButton: boolean;
    cashManageButton: boolean;
    cashTransactionApproveAction: boolean;
    cashTransactionEditAction: boolean;
    cashTransactionCancelAction: boolean;
    cashActualOpeningBalanceAction: boolean;
    cashActualOpeningDateAction: boolean;
    cashActualPrintAction: boolean;
    cashActualExportAction: boolean;
    cashManageSettingsAction: boolean;
    cashManageReportsAction: boolean;
    cashManageEditAction: boolean;
    cashManageDeleteAction: boolean;
    cashManageCreateButton: boolean;
    cashDebtsToPayButton: boolean;
    cashDebtsToPayTotalPayAction: boolean;
    cashDebtsToPayPartialPayAction: boolean;
    purchasesSection: boolean;
    purchasesRegisterDocumentsButton: boolean;
    purchasesRegisterDocumentsCreateButton: boolean;
    purchasesVerifyAction: boolean;
    purchasesEditAction: boolean;
    purchasesDeleteAction: boolean;
    thirdPartiesSection: boolean;
    thirdPartiesWholesaleButton: boolean;
    thirdPartiesProvidersButton: boolean;
    thirdPartiesCustomersButton: boolean;
    reportsSection: boolean;
    reportsSystemStatsButton: boolean;
    reportsSystemActivityButton: boolean;
    reportsSalesButton: boolean;
    reportsCashButton: boolean;
    reportsProductionButton: boolean;
    configurationsSection: boolean;
    configurationsAccountsButton: boolean;
    configurationsPermitsButton: boolean;
    regDate: number;
}

export interface SerialNumber {
    id: string;
    index?: number;
    serie: number;
    productId: string;
    location: string | Store;
    name: string;
    code: string;
    color: string;
    status: string;
    customer?: Customer | WholesaleCustomer;
    productionPath?: string;
    departurePath?: string;
    cashTransactionPath?: string;
    regDate: number;
    createdBy: User;
    modifiedBy?: User;
    modifiedDate?: number;
    separatedBy?: User;
    separateDate?: number;
    soldBy?: User;
    saleDate?: number;
}

export interface Color {
    id: string;
    name: string;
    regDate: number;
}

export interface Product {
    id: string;
    name: string;
    code: string;
    category: string;
    description: string;
    image: string;
    correlative: number;
    initialStock: number;
    stock: number;
    rawMaterialList?: RawMaterialList;
    sale: number;
    regDate: number;
}

export interface Requirement {
    id: string;
    correlative: number;
    status: string;
    product: Product;
    color: string;
    quantity: number;
    description: string;
    image1: string;
    image2: string;
    file1: string;
    file2: string;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    approvedBy?: string;
    approvedByUid?: string;
    approvedDate?: number;
    canceledBy?: string;
    canceledByUid?: string;
    canceledDate?: number;
}

export interface Correlative {
    id: string;
    correlative: number;
    regDate: number;
}

export interface Document {
    id: string;
    name: string;
    serie: number;
    correlative: number;
    regDate: number;
}

export interface Order {
    id: string;
    correlative: number;
    ORCorrelative?: number;
    OPeCorrelative?: number;
    quotationCorrelative?: number;
    orderNote?: number;
    document: Document;
    documentSerial?: number;
    documentCorrelative: string;
    deliveryDate: number;
    proposedDate?: number;
    status: string;
    quantity: number;
    totalImport: number;
    paidImport: number;
    indebtImport: number;
    cash: Cash;
    description: string;
    image1: string;
    image2: string;
    file1: string;
    file2: string;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    approvedBy?: string;
    approvedByUid?: string;
    approvedDate?: number;
}

export interface Quotation {
    id: string;
    correlative: number;
    deliveryDate: number;
    status: string;
    orderReference?: number;
    recommendations?: string;
    import?: number;
    proposedDate?: number;
    quantity: number;
    description: string;
    image1: string;
    image2: string;
    file1: string;
    file2: string;
    quotationPDF?: string;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    approvedBy?: string;
    approvedByUid?: string;
    approvedDate?: number;
}

export interface RawMaterial {
    id: string;
    category: string;
    brand: string;
    code: string;
    name: string;
    unit: string;
    stock: number;
    purchase: number;
    sale: number;
}

export interface RawMaterialList {
    id: string;
    rawList: Array<RawMaterial>;
    otherResources: Array<OtherResource>;
    cost: number;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    lastUpdateBy?: string;
    lastUpdateByUid?: string;
    lastUpdateDate?: number;
}

export interface OtherResource {
    id: string;
    description: string;
    cost: number;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    lastUpdateBy?: string;
    lastUpdateByUid?: string;
    lastUpdateDate?: number;

}

export interface Category {
    id: string;
    name: string;
    source: string;
    regDate: number;
}

export interface Store {
    id: string;
    name: string;
    supervisor?: User;
    regDate: number;
}

export interface Unit {
    id: string;
    name: string;
    regDate: number;
}

export interface ProductionOrder {
    id: string;
    correlative: number;
    ORCorrelative?: number;
    OPeCorrelative?: number;
    quotationCorrelative?: number;
    orderNote?: number;
    product?: Product;
    document?: Document;
    documentSerial?: number;
    documentCorrelative?: string;
    deliveryDate?: number;
    status: string;
    color?: string;
    quantity: number;
    totalImport?: number;
    paidImport?: number;
    indebtImport?: number;
    cash?: Cash;
    description: string;
    image1: string;
    image2: string;
    file1: string;
    file2: string;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    approvedBy?: string;
    approvedByUid?: string;
    approvedDate?: number;
    startedBy?: string;
    startedByUid?: string;
    startedDate?: number;
    finalizedBy?: string;
    finalizedByUid?: string;
    finalizedDate?: number;
}

export interface TicketRawMaterial {
    id: string;
    document: string;
    documentSerial: number;
    documentCorrelative: string;
    provider?: Provider;
    raw: RawMaterial;
    quantity: number;
    totalPrice: number;
    unitPrice?: number;
    source: string;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    canceledBy?: string;
    canceldByUid?: string;
    canceledDate?: number;
}

export interface TicketProduct {
    id: string;
    OPCorrelative: string;
    product: Product;
    quantity: number;
    source: string;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    canceledBy?: string;
    canceldByUid?: string;
    canceledDate?: number;
}

export interface Departure {
    id: string;
    document: Document;
    documentSerial: number;
    documentCorrelative: number;
    OPCorrelative?: string;
    raw?: RawMaterial;
    product?: Product;
    serie?: number;
    color?: string;
    quantity: number;
    price: number;
    discount: number;
    paymentType: string;
    destinationAccount?: string;
    location?: string | Store;
    customerType?: string;
    customer?: WholesaleCustomer | Customer;
    source: string;
    rawMaterialPath?: string;
    productPath?: string;
    cashTransactionPath?: string;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    canceledBy?: string;
    canceldByUid?: string;
    canceledDate?: number;
}

export interface Transfer {
    id: string;
    correlative: string;
    origin: Store;
    destination: Store;
    serialList: Array<SerialNumber>;
    transferList?: Array<TransferList>;
    status: string;
    source: string;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    approvedBy?: string;
    approvedByUid?: string;
    approvedDate?: number;
    canceledBy?: string;
    canceledByUid?: string;
    canceledDate?: number;
    carriedBy?: string;
    carriedByUid?: string;
    carriedDate?: number;
    receivedBy?: string;
    receivedByUid?: string;
    receivedDate?: number;
    rejectedBy?: string;
    rejectedByUid?: string;
    rejectedDate?: number;
}

export interface TransferList {
    product: Product;
    serialList: Array<SerialNumber>;
}

export interface TransferItem {
    id: string;
    item: Product | RawMaterial;
    serie: number;
    regDate: number;
}

export interface Provider {
    id: string;
    name: string;
    address: string;
    ruc: number;
    phone?: string;
    detractionAccount?: string;
    contacts?: Array<{
        contactName: string;
        contactPhone?: string;
        contactMail?: string;
    }>;
    bankAccounts?: Array<{
        bank: string;
        type: string;
        accountNumber: string;
    }>;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    editedBy?: User;
    editedDate?: number;
}

export interface WholesaleCustomer {
    id: string;
    type: string;
    name?: string;
    lastname?: string;
    displayName?: string;
    address?: string;
    dni?: number;
    phone?: string;
    mail?: string;
    creditNote?: CreditNote;
    businessName?: string;
    businessAddress?: string;
    ruc?: number;
    businessPhone?: string;
    contacts?: Array<{
        contanctName?: string;
        contactPhone?: string;
        contactMail?: string;
    }>;
    regDate: number;
    createdBy: User;
    editedBy?: User | null;
    editedDate?: number | null;
}

export interface Customer {
    id: string;
    type: string;
    name?: string;
    lastname?: string;
    displayName?: string;
    address?: string;
    dni?: number;
    phone?: string;
    mail?: string;
    creditNote?: CreditNote;
    businessName?: string;
    businessAddress?: string;
    ruc?: number;
    businessPhone?: string;
    contacts?: Array<{
        contanctName?: string;
        contactPhone?: string;
        contactMail?: string;
    }>;
    regDate: number;
    createdBy: User;
    editedBy?: User | null;
    editedDate?: number | null;
}

export interface Cash {
    id: string;
    currentOwner: User | { displayName: string } | null;
    currentOpening?: string;
    name: string;
    location: Store | { name: string };
    open: boolean;
    password: string;
    supervisor: User | { displayName: string };
    lastOpening: number;
    lastClosure: number;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    lastEditBy: string;
    lastEditByUid: string;
    lastEditDate: number;
}

export interface CurrentCash extends Cash {
    currentOpening: string;
}

export interface CashOpening {
    id?: string;
    openedBy: string;
    openedByUid: string;
    closedBy: string;
    closedByUid: string;
    openingDate: number;
    closureDate: number;
    openingBalance: number;
    closureBalance: number;
    importAdded: number;
    importWithdrawn: number;
    cashCount: number;
    reOpenedBy: string;
    reOpenedByUid: string;
    reOpenedDate: number;
    currentCash: CurrentCash;
    totalImport?: number;
    totalTickets?: number;
    totalDepartures?: number;
    totalTicketsByPaymentType?: {
        'TARJETA VIDA': number;
        'TARJETA MASTERCARD': number;
        'TARJETA ESTILOS': number;
        'EFECTIVO': number;
    };
    totalDeparturesByPaymentType?: {
        'TRANSFERENCIA': number;
        'EFECTIVO': number;
    }
}

export interface Transaction {
    id: string;
    regDate: number;
    type: string;
    description?: string;
    import: number;
    user: User;
    verified: boolean;
    status: string;
    ticketType: string;
    paymentType: string;
    expenseType?: string;
    departureType?: string;
    originAccount?: string;
    destinationAccount?: string;
    debt?: number;
    separatePath?: string;
    departurePath?: string;
    productPath?: string;
    lastEditBy: string;
    lastEditUid: string;
    lastEditDate: number;
    approvedBy: string;
    approvedByUid: string;
    approvedDate: number;
}

export interface TotalImports {
    currentCash: CurrentCash;
    totalImport: number;
    totalTickets: number;
    totalDepartures: number;
    totalTicketsByPaymentType: {
        'TARJETA VIDA': number;
        'TARJETA MASTERCARD': number;
        'TARJETA ESTILOS': number;
        'EFECTIVO': number;
    };
    totalDeparturesByPaymentType: {
        'TRANSFERENCIA': number;
        'EFECTIVO': number;
    }
}

export interface Purchase {
    id: string;
    documentDate: number;
    documentType: string;
    documentSerial: number;
    documentCorrelative: number;
    provider: Provider;
    itemsList: Array<{
        index: number;
        item: { name: string, code: string } | RawMaterial;
        quantity: number;
        import: number;
    }>;
    payments: Array<{
        type: string;
        paymentType: string;
        import: number;
        cashReference: Cash;
        paidBy: string;
        paidByUid: string;
        regDate: number;
    }>;
    creditDate: number;
    paymentDate: number;
    totalImport: number;
    subtotalImport: number;
    igvImport: number;
    paymentType: string;
    paidImport: number;
    indebtImport: number;
    verifiedByAccountant: boolean;
    detractionApplies: boolean;
    detractionPercentage: number;
    detractionImport?: number;
    detractionDate?: number;
    isRawMaterial?: boolean;
    source: string;
    status: string;
    regDate: number;
    createdBy: string;
    createdByUid: string;
    editedBy: string;
    editedByUid: string;
    editedDate: number;
    approvedBy: string;
    approvedByUid: string;
    approvedDate: number;
    verifiedBy: string;
    verifiedByUid: string;
    verifiedDate: number;
}

export interface CreditNote {
    id: string;
    documentName: string;
    documentSerial: string;
    documentCorrelative: number;
    customer: Customer | WholesaleCustomer;
    serial: SerialNumber;
    returnImport: number;
    status: string;
    separateProductPath: string;
    separateTransactionPath: string;
    productPath: string;
    regDate: number;
    createdBy: User;
    approvedBy?: User;
    approvalDate?: number;
    canceledBy?: User;
    cancellationDate?: number;
}

export interface SystemActivityEvent {
    id: string;
    event: string;
    description: string;
    module: string;
    section: string;
    regDate: number;
    createdBy: User;
}

export interface SalesCounter {
    id: string;
    requirements: number;
    orders: number;
    quotations: number;
    stores: number;
    checkStock: number;
    regDate: number;
    lastUpdate: number;
}

export interface SeparateProduct {
    id: string;
    documentName: string;
    documentSerial: string;
    documentCorrelative: number;
    customerType?: string;
    customer: Customer | WholesaleCustomer;
    serial: SerialNumber;
    paidImport: number;
    indebtImport: number;
    productPath: string;
    cashTransactionPath: string;
    createdBy: User;
    regDate: number;
    soldBy?: User;
    saleDate?: number;
    canceledBy?: User;
    cancelDate?: number;
}