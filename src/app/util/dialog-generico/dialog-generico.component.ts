import { Component, Input, OnInit, Inject, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtentiService, Utente } from '../../services/utenti/utenti.service';
import { debounceTime } from 'rxjs/operators';

// Definizione del tipo Address
interface Address {
  display_name: string;
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-dialog-generico',
  standalone: true,
  templateUrl: './dialog-generico.component.html',
  styleUrls: ['./dialog-generico.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
})
export class DialogGenericoComponent implements OnInit, AfterViewInit {

  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() saveLabel: string = 'Salva';
  @Input() fields: any[] = [];

  // FormGroup reattivo che rappresenta il form dinamico
  form: FormGroup = this.fb.group({});

  // Gestione eventuale campo manager
  managers: Utente[] = [];

  // Gestione eventuale campo indirizzo
  addressSuggestions: Address[] = [];
  private selectedAddress: Address | null = null;

  // Gestione filtro autocomplete categoria
  categoryOptions: string[] = [];
  filteredCategoryOptions: string[] = [];
  manualCategory: string = '';
  
  // Riferimenti al select panel e al dialog che scrolla
  @ViewChild(MatAutocompleteTrigger) selectPanel?: MatAutocompleteTrigger;
  @ViewChild('dialogBody', { read: ElementRef }) dialogBody?: ElementRef;


  ngAfterViewInit() {
    // Chiude il pannello autocomplete se si scrolla il body del dialog
    if (this.dialogBody && this.selectPanel) {
      this.dialogBody.nativeElement.addEventListener('scroll', () => {
        this.selectPanel?.closePanel();
      });
    }
  }

  
  // Costruttore: inietta i servizi necessari e inizializza i valori degli input tramite i dati passati al dialog
  constructor(
    private fb: FormBuilder, // Per la creazione del form
    private dialogRef: MatDialogRef<DialogGenericoComponent>, // Riferimento al componente come Dialog
    @Inject(MAT_DIALOG_DATA) public data: any, // Struttura che contiene l'input passato a questo componente
    private utentiService: UtentiService,
    private snackBar: MatSnackBar
  ) {

    // Inizializzazione dei valori tramite i dati passati in input
    if (data) {
      this.fields = data.fields ?? this.fields;
      this.title = data.title ?? this.title;
      this.subtitle = data.subtitle ?? this.subtitle;
      this.icon = data.icon ?? this.icon;
      this.saveLabel = data.saveLabel ?? this.saveLabel;
      // Se il campo categoria ha opzioni, le salvo
      const catField = this.fields.find(f => f.name === 'category' && f.options);
      if (catField) {
        this.categoryOptions = catField.options;
        this.filteredCategoryOptions = catField.options;
      }
    }
    
  }

  ngOnInit() {
    this.buildForm(); // Costruisce il form

    if (this.hasManagerField()) this.loadManagers();

    // Imposta il debounce per il campo indirizzo se presente
    if (this.hasAddressField()) {
      this.gestisciAddressDebounce();
      // Resetto selectedAddress se l'utente modifica manualmente il campo
      this.form.get('address')?.valueChanges.subscribe(val => {
        this.selectedAddress = null;
      });
    }

    // Gestione filtro autocomplete categoria
    if (this.hasCategoryAutocompleteField()) {
      this.form.get('category')?.valueChanges.subscribe(val => {
        this.filterCategoryOptions(val);
      });
    }

  }

  private buildForm() {
    const group: any = {};
    for (const field of this.fields) {
      const validators = [] as any[];
      if (field.required) {
        validators.push(Validators.required);
      }

      // Barcode EAN 13: esattamente 13 caratteri numerici
      if (field.name === 'barcode') {
        validators.push(Validators.pattern(/^[0-9]{13}$/));
      }

      // Validazione custom per categoria: solo lettere e spazi
      if (field.name === 'category' && field.type === 'category-autocomplete') {
        validators.push(this.noNumbersValidator());
      }

      // Validazione custom per indirizzo: deve essere selezionato dai suggerimenti
      if (field.name === 'address' && field.type === 'autocomplete') {
        validators.push(this.addressValidator());
      }

      group[field.name] = ['', validators.length ? validators : null];
    }
    this.form = this.fb.group(group);
  }

  private hasManagerField(): boolean {
    return this.fields.some(f => f.name === 'managerName');
  }

  private loadManagers() {
    this.utentiService.getManagers().subscribe({
      next: managers => this.managers = managers,
      error: () => this.managers = []
    });
  }

  private hasAddressField(): boolean {
    return this.fields.some(f => f.name === 'address');
  }

  private gestisciAddressDebounce(): void { // per ridurre le chiamate alle API di suggerimento indirizzo
    this.form.get('address')?.valueChanges // valueChanges emette ogni volta che viene scritto/cancellato un carattere dal campo indirizzo
      .pipe(
        debounceTime(600), // Attende a seguito di un emit, se nell'attesa arriva un altro emit, ricomincia ad attendere
      )
      .subscribe(address => {
        this.gestisciAddressSuggestions(address); // se il Debounce termina allora chiama le API
      });
  }

  gestisciAddressSuggestions(address: string): void {
    if (!address || address.length < 4) {
      this.addressSuggestions = [];
      return;
    }
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=3df764e9073e432cb03349b70a805e52&language=it&limit=5`;
    fetch(url)
      .then(res => res.json())
      .then((data: any) => {
        this.addressSuggestions = (data?.results || []).map((r: any) => ({
          display_name: r.formatted,
          lat: Number(r.geometry.lat),
          lon: Number(r.geometry.lng),
        }));
      });
  }

  onSelectAddress(event: MatAutocompleteSelectedEvent): void { // quando seleziono un indirizzo tra quelli suggeriti
    const selected = event.option.value; // stringa selezionata dall'utente
    const address = this.addressSuggestions.find(s => s.display_name === selected); // oggetto effettivo a cui si riferisce, ottenuto dalle API
    this.selectedAddress = address ?? null;
    this.form.get('address')?.setValue(selected, { emitEvent: false }); // aggiorno il valore del campo per la spunta
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Se il form contiene il campo address, lo valido verificando che abbia lat e lon
    if (this.hasAddressField()) {
      if (!this.selectedAddress || isNaN(this.selectedAddress.lat) || isNaN(this.selectedAddress.lon)) {
        this.snackBar.open('Seleziona un indirizzo valido dai suggerimenti!', 'Chiudi', { duration: 3000 });
        return;
      }

      const result = { ...this.form.value, latitude: this.selectedAddress.lat, longitude: this.selectedAddress.lon };
      this.dialogRef.close(result);

    } else {

      this.dialogRef.close(this.form.value);

    }
  }

  cancel() {
    this.dialogRef.close(false);
  }

  filterBarcode(event: any) {
    let onlyNumbers = event.target.value.replace(/[^0-9]/g, '');
    if (onlyNumbers.length > 13) {
      onlyNumbers = onlyNumbers.slice(0, 13);
    }
    event.target.value = onlyNumbers;
    this.form.get('barcode')?.setValue(onlyNumbers, { emitEvent: false });
  }

  private hasCategoryAutocompleteField(): boolean {
    return this.fields.some(f => f.name === 'category' && f.type === 'category-autocomplete');
  }

  filterCategoryOptions(val: string) {
    if (!val) {
      this.filteredCategoryOptions = this.categoryOptions;
      return;
    }
    const filterValue = val.toLowerCase();
    this.filteredCategoryOptions = this.categoryOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  filterCategory(event: any) {
    let onlyLetters = event.target.value.replace(/[^a-zA-ZàèéìòùÀÈÉÌÒÙçÇ\s]/g, '');
    event.target.value = onlyLetters;
    this.form.get('category')?.setValue(onlyLetters, { emitEvent: false });
  }

  noNumbersValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const valid = /^[a-zA-ZàèéìòùÀÈÉÌÒÙçÇ\s]*$/.test(control.value || '');
      return valid ? null : { onlyLetters: true };
    };
  }

  addressValidator(): ValidatorFn {
    return () => {
      // Se selectedAddress è nullo, il campo è invalid
      return this.selectedAddress ? null : { invalidAddress: true };
    };
  }

}
