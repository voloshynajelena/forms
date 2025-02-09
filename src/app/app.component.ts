import { NgForOf, NgIf, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

// Custom validator function
function ageValidator(control: FormControl): ValidationErrors | null {
  if (control.value && (control.value < 1 || control.value > 100)) {
    return { invalidAge: true };
  }
  return null;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  styleUrls: ['./app.component.scss'],
  imports: [ReactiveFormsModule, NgIf, NgForOf, TitleCasePipe],
})
export class AppComponent implements OnInit {
  userForm: FormGroup | undefined;
  isUnderage: boolean = false;
  experienceValue: number = 0;
  contactMethods = ['Email', 'Phone', 'SMS', 'WhatsApp'];

  ngOnInit(): void {
    this.userForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      dob: new FormControl('', Validators.required),
      message: new FormControl(''),
      favoriteColor: new FormControl(''),
      age: new FormControl(0, [Validators.required, ageValidator]),
      experience: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(50)]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      website: new FormControl('', [Validators.required, Validators.pattern('https?://.+')]),
      gender: new FormControl(''),
      preferredContact: new FormArray([]), // Initialize FormArray
      country: new FormControl('us'),
      address: new FormGroup({
        street: new FormControl(''),
        city: new FormControl(''),
      }),
      skills: new FormArray([new FormControl('')]),
    });

    // Initialize preferred contact checkboxes
    this.initPreferredContact();

    // Handle dynamic form behavior
    this.userForm.valueChanges.subscribe(value => {
      if (this.userForm?.get('age')?.value && this.userForm?.get('age')?.value < 18) {
        this.isUnderage = true;
        this.disableSubmitButton();
      } else {
        this.isUnderage = false;
        this.enableSubmitButton();
      }
      // console.log('User Information Updated:', value);
    });

    this.userForm.get('age')?.valueChanges.subscribe(age => {
      if (age < 18) {
        this.showUnderageMessage();
      }
    });
  }

  // Getter for dynamic skills FormArray
  get skills() {
    return (this.userForm?.get('skills') as FormArray);
  }

  // Show underage message
  showUnderageMessage() {
    return this.isUnderage ? 'You must be over 18 to submit the form.' : '';
  }

  // Update experience slider value
  onExperienceChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.experienceValue = +input.value;
  }

  // Disable the submit button
  disableSubmitButton() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
    }
  }

  // Enable the submit button
  enableSubmitButton() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.removeAttribute('disabled');
    }
  }

  // Add skill to the FormArray
  addSkill() {
    this.skills.push(new FormControl(''));
  }

  // Remove skill from the FormArray
  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  // Getter for preferred contact checkboxes
  get preferredContact() {
    return (this.userForm?.get('preferredContact') as FormArray);
  }

// Initialize preferred contact checkboxes with empty array
  initPreferredContact() {
    const formArray = this.userForm?.get('preferredContact') as FormArray;
    formArray.clear(); // Clear any existing values before initializing

    this.contactMethods.forEach(() => formArray.push(new FormControl(''))); // Initialize with empty string
  }


  // Handle changes in preferred contact method (checkboxes)
  onPreferredContactChange(event: any, contactMethod: string) {
    const formArray: FormArray = this.userForm?.get('preferredContact') as FormArray;

    if (event.target.checked) {
      // Add contact method name if selected
      formArray.push(new FormControl(contactMethod));
    } else {
      // Remove contact method if unselected
      const index = formArray.controls.findIndex(control => control.value === contactMethod);
      if (index !== -1) {
        formArray.removeAt(index);
      }
    }
  }

  // Get selected contact methods
  getSelectedContacts(): string[] {
    return this.contactMethods.filter((_, i) => this.preferredContact.value[i]);
  }

  // Handle form submission
  onSubmit(): void {
    if (this.userForm?.valid) {
      alert('Form submitted successfully!');
      console.log('User Details:', this.userForm.value);
      console.log('Selected Contact Methods:', this.getSelectedContacts());
    } else {
      alert('Please fill the form correctly.');
    }
  }
}
