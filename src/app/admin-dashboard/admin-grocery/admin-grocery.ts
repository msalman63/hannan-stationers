import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Grocery } from '../../interfaces/grocery';
import { SupabaseService } from '../../shared/services/supabase-service';
import { ToastrService } from 'ngx-toastr';
import { Modal } from '../../shared/components/modal/modal';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-admin-grocery',
  imports: [CommonModule, ReactiveFormsModule, Modal , Spinner],
  templateUrl: './admin-grocery.html',
  styleUrl: './admin-grocery.css',
})
export class AdminGrocery {
  groceryForm!: FormGroup;
  groceryItems = signal<Grocery[]>([]);
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  isPageLoading : boolean = true;

  selectedFile: File | null = null;
  previewUrl: string | null = null; // Local preview URL before upload
  imagePreview = signal<string[]>([]);
  private supabaseService = inject(SupabaseService);
  private toastr = inject(ToastrService);

  isEditMode: boolean = false;
  editGroceryId: string | null = null;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.formReset();
  }

  async ngOnInit() {
    await this.getGrocery();
    this.isPageLoading = false;
  }

  // Load Grocery Items
  private async getGrocery() {
    const { data, error } = await this.supabaseService.getAllGrocery();
    if (error) return;
    this.groceryItems.set(data ?? []);
  }

  constructor(private fb: FormBuilder) {
    // Initialize the form with required validators
    this.groceryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [null, Validators.required],
      image: ['', Validators.required],
    });
  }

  // Function for handling file input change , stores selected file and generates a local preview URL
  //imagePreview.update() to push the new preview URL into the signal.
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.previewUrl = URL.createObjectURL(this.selectedFile);

      this.imagePreview.set([this.previewUrl!]);
      //tells the form image field is now filled
      this.groceryForm.patchValue({ image: this.previewUrl });
      this.groceryForm.get('image')?.updateValueAndValidity();
    }
  }

  //Function for clearing one image...
  removeImage(index: number) {
    // Remove from preview signal
    this.imagePreview.update((prev) => prev.filter((_, i) => i !== index));
    // mark image as empty again so button disables
    this.groceryForm.patchValue({ image: '' });
    this.groceryForm.get('image')?.updateValueAndValidity();
  }

  // Prepare form for editing and populate form
  startUpdate(grocery: Grocery) {
    if (!grocery.id) return;
    this.isEditMode = true;
    this.isModalOpen = true;
    this.editGroceryId = grocery.id;

    this.groceryForm.patchValue({
      name: grocery.name,
      description: grocery.description,
      price: grocery.price,
      image: grocery.image,
    });
    //set the image to show image on preview...
    this.imagePreview.set([grocery.image]);
  }

  // Resets the form
  formReset() {
    this.groceryForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.isEditMode = false;
    this.isModalOpen = false;
    this.editGroceryId = null;
    this.imagePreview.set([]);
  }

  async onSubmit() {
    // Stop if form is invalid
    if (this.groceryForm.invalid) {
      this.groceryForm.markAllAsTouched();
      return;
    }

    // In add mode, a file must be selected
    if (!this.isEditMode && !this.selectedFile) return;

    this.isLoading = true;

    try {
      // Grocery object from form values
      const groceryData: Grocery = {
        name: this.groceryForm.value.name,
        description: this.groceryForm.value.description,
        price: this.groceryForm.value.price,
        image: this.groceryForm.value.image, // Holds existing URL in edit mode
      };

      if (this.isEditMode && this.editGroceryId) {
        if (this.selectedFile) {
          // User selected a new image , replace old image in storage and get new URL
          const newImageUrl = await this.supabaseService.replaceImage(
            groceryData.image,
            this.selectedFile,
            'grocery',
          );
          await this.supabaseService.updateGrocery(this.editGroceryId, {
            ...groceryData,
            image: newImageUrl,
          });
        } else {
          // No new image selected , update record with existing image URL
          await this.supabaseService.updateGrocery(this.editGroceryId, groceryData);
        }
        this.toastr.success('Grocery Updated Successfully!');
      } else {
        // Add mode , upload image first, then save new record with returned URL
        const imageUrl = await this.supabaseService.uploadImage(this.selectedFile!, 'grocery');
        await this.supabaseService.addGrocery({
          ...groceryData,
          image: imageUrl,
        });
        this.toastr.success('Grocery Added Successfully!');
      }
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to Save Grocery!');
    } finally {
      this.formReset();
      this.isLoading = false;
    }
  }

  // Deletes a Grocery item , first delete image, then deletes record
  async deleteGrocery(id: string) {
    const confirmed = confirm('Are you sure you want to delete this Grocery?');
    if (!confirmed) return;
    if (!id) return;

    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseService.getSingleGroceryItem(id);

      if (error) throw error;

      // Delete the image from storage first using the image URL
      await this.supabaseService.deleteImage(data.image);

      // Delete the database record
      await this.supabaseService.deleteGrocery(id);

      this.toastr.success('Grocery Deleted Successfully!');
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to delete Grocery!');
    } finally {
      this.isLoading = false;
    }
  }
}
