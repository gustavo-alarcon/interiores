import { Injectable } from '@angular/core';
import { AngularFirestoreDocument, AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { User, Permit } from './types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // *********** USER PERMITS - (START) ***************************
  // -------------------------- PERMITS --------------------------------------
  public permitDocument: AngularFirestoreDocument<Permit>;
  public permit: Permit =
    {
      id: '',
      name: '',
      salesSection: false,
      salesRequirementsButton: false,
      requirementsCompleteList: false,
      salesQuotationsButton: false,
      quotationsCompleteList: false,
      salesOrdersButton: false,
      ordersCompleteList: false,
      salesShoppingButton: false,
      salesStoresButton: false,
      salesCheckStockButton: false,
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
      cashDebtsToPayTotalPayAction: false,
      cashDebtsToPayPartialPayAction: false,
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

  public dataPermit = new BehaviorSubject<Permit>(
    {
      id: '',
      name: '',
      salesSection: false,
      salesRequirementsButton: false,
      requirementsCompleteList: false,
      salesQuotationsButton: false,
      quotationsCompleteList: false,
      salesOrdersButton: false,
      ordersCompleteList: false,
      salesShoppingButton: false,
      salesStoresButton: false,
      salesCheckStockButton: false,
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
      cashDebtsToPayTotalPayAction: false,
      cashDebtsToPayPartialPayAction: false,
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
    }
  );
  public currentDataPermit = this.dataPermit.asObservable();

  // *********** NOTIFICATIONS UNSEEN - (START) ***************************
  notificationsCollection: AngularFirestoreCollection<any[]>;
  notifications: Array<any> = [];

  public dataNotifications = new BehaviorSubject<any[]>([]);
  currentDataNotifications = this.dataNotifications.asObservable();

  // *********** NOTIFICATIONS COMPLETE - (START) ***************************
  notificationsCompleteCollection: AngularFirestoreCollection<any[]>;
  notificationsComplete: Array<any> = [];

  public dataNotificationsComplete = new BehaviorSubject<any[]>([]);
  currentDataNotificationsComplete = this.dataNotificationsComplete.asObservable();
  // ************************************************************************* //

  user: Observable<User> = of(null);

  userInteriores: User = null;
  public dataUserInteriores = new BehaviorSubject<User>(null);
  public currentDataUserInteriores = this.dataUserInteriores.asObservable();

  authLoader: boolean = false;
  now = new Date();

  audio_android = new Audio();
  audio_ios = new Audio();

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    public snackbar: MatSnackBar
  ) {
    // USER PERSISTENCE VALIDATION
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.afs.doc<User>(`users/${user.uid}`).valueChanges().subscribe(user => {
          this.userInteriores = user;
          this.dataUserInteriores.next(user);

          this.permitDocument = this.afs.doc<Permit>(`db/${this.userInteriores.db}/permits/${this.userInteriores.permitId}`);
          this.permitDocument.valueChanges().subscribe(res => {
            this.permit = res;
            this.dataPermit.next(res);
          });

          this.notificationsCollection =
            this.afs.collection(`users/${this.userInteriores.uid}/notifications`, ref => ref.where('status', '==', 'unseen'));

          this.notificationsCollection.valueChanges().subscribe(res => {
            const sorted = res.sort((a, b) => b['regDate'] - a['regDate']);
            this.notifications = sorted;
            this.dataNotifications.next(sorted);
          });

          this.notificationsCompleteCollection =
            this.afs.collection(`users/${this.userInteriores.uid}/notifications`, ref => ref.orderBy('regDate', 'desc'));

          this.notificationsCompleteCollection.valueChanges().subscribe(res => {
            this.notificationsComplete = res;
            this.dataNotificationsComplete.next(res);
          });

        });
      } else {
        this.router.navigateByUrl('/login');
      }
    });
  }

  // ************* NOTIFICATIONS
  // Play notification Sound
  playNotification(): void {
    this.audio_android.play();
    this.audio_ios.play();
  }

  // Change status of notification to seen
  notificationSeen(id): void {
    this.notificationsCollection.doc(`${id}`).update({
      status: 'seen'
    });
  }

  // Change state of notification to unseen
  notificationUnseen(id): void {
    this.notificationsCollection.doc(`${id}`).update({
      status: 'unseen'
    });
  }

  // ********* EMAIL LOGIN

  emailLogin(email: string, password: string) {
    this.authLoader = true;
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then(credential => {
        if (credential) {
          this.afs.doc<User>(`users/${credential.user.uid}`).get().forEach(snapshot => {
            if (snapshot.data().lastRoute) {
              this.authLoader = false;
              this.router.navigateByUrl(snapshot.data().lastRoute);
            } else {
              this.authLoader = false;
              this.router.navigateByUrl('/main');
            }
          })
        }
      })
      .catch(error => this.handleError(error));
  }

  // ******** SIGN OUT

  signOut() {
    this.userInteriores = null;

    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  // ********** ERROR HANDLING

  private handleError(error) {

    let message = '';

    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Error: El formato del correo es incorrecto';
        break;

      case 'auth/wrong-password':
        message = 'Error: El password es incorrecto o el usuario no tiene un password';
        break;

      case 'auth/user-disabled':
        message = 'Error: El usuario esta deshabilitado';
        break;

      case 'auth/user-not-found':
        message = 'Error: El usuario no está registrado';
        break;

      default:
        message = 'Hmmm esto es nuevo ...' + error.code;
        break;
    }
    this.snackbar.open(message, 'Cerrar', {
      duration: 6000,
    });

    this.authLoader = false;
  }

  saveLastRoute(url: string): void {
    this.afs.doc(`users/${this.userInteriores.uid}`)
      .update({ lastRoute: url })
      .catch(err => {
        this.snackbar.open('Error guardando la última ruta', 'Cerrar', {
          duration: 6000
        });
        console.log(err);
      })
  }
}
