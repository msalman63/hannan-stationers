import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Deals } from '../../interfaces/deals';
import { SupabaseService } from '../../shared/services/supabase-service';
import { ToastrService } from 'ngx-toastr';
import { Modal } from '../../shared/components/modal/modal';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-admin-deals',
  imports: [CommonModule , ReactiveFormsModule, Modal , Spinner],
  templateUrl: './admin-deals.html',
  styleUrl: './admin-deals.css',
})
export class AdminDeals {
  dealsForm!: FormGroup;
  dealsItems = signal<Deals[]>([]);
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  isPageLoading: boolean = true;

  selectedFile: File | null = null;
  previewUrl: string | null = null; // Local preview URL before upload
  imagePreview = signal<string[]>([]);
  private supabaseService = inject(SupabaseService);
  private toastr = inject(ToastrService);

  isEditMode: boolean = false;
  editdealsId: string | null = null;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.formReset();
  }

  async ngOnInit() {
    await this.getDeals();
    this.isPageLoading = false;
  }

  // Load Deals Items
  private async getDeals() {
    const { data, error } = await this.supabaseService.getAllDeals();
    if (error) return;
    this.dealsItems.set(data ?? []);
  }

  constructor(private fb: FormBuilder) {
    // Initialize the form with required validators
    this.dealsForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [null, Validators.required],
      image: ['', Validators.required],
      category: ['', Validators.required]
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
      this.dealsForm.patchValue({ image: this.previewUrl });
      this.dealsForm.get('image')?.updateValueAndValidity();
    }
  }

  //Function for clearing one image...
  removeImage(index: number) {
    // Remove from preview signal
    this.imagePreview.update((prev) => prev.filter((_, i) => i !== index));
    // mark image as empty again so button disables
    this.dealsForm.patchValue({ image: '' });
    this.dealsForm.get('image')?.updateValueAndValidity();
  }

  // Prepare form for editing and populate form
  startUpdate(deal: Deals) {
    if (!deal.id) return;
    this.isEditMode = true;
    this.isModalOpen = true;
    this.editdealsId = deal.id;

    this.dealsForm.patchValue({
      name: deal.name,
      description: deal.description,
      price: deal.price,
      image: deal.image,
      category : deal.category
    });
    //set the image to show image on preview...
    this.imagePreview.set([deal.image]);
  }

  // Resets the form
  formReset() {
    this.dealsForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.isEditMode = false;
    this.isModalOpen = false;
    this.editdealsId = null;
    this.imagePreview.set([]);
  }

  async onSubmit() {
    // Stop if form is invalid
    if (this.dealsForm.invalid) {
      this.dealsForm.markAllAsTouched();
      return;
    }

    // In add mode, a file must be selected
    if (!this.isEditMode && !this.selectedFile) return;

    this.isLoading = true;

    try {
      // deal object from form values
      const dealsData: Deals = {
        name: this.dealsForm.value.name,
        description: this.dealsForm.value.description,
        price: this.dealsForm.value.price,
        image: this.dealsForm.value.image, // Holds existing URL in edit mode
        category : this.dealsForm.value.category
      };

      if (this.isEditMode && this.editdealsId) {
        if (this.selectedFile) {
          // User selected a new image , replace old image in storage and get new URL
          const newImageUrl = await this.supabaseService.replaceImage(
            dealsData.image,
            this.selectedFile,
            'deals',
          );
          await this.supabaseService.updateDeals(this.editdealsId, {
            ...dealsData,
            image: newImageUrl,
          });
        } else {
          // No new image selected , update record with existing image URL
          await this.supabaseService.updateDeals(this.editdealsId, dealsData);
        }
        this.toastr.success('Deal Updated Successfully!');
      } else {
        // Add mode , upload image first, then save new record with returned URL
        const imageUrl = await this.supabaseService.uploadImage(this.selectedFile!, 'deals');
        await this.supabaseService.addDeals({
          ...dealsData,
          image: imageUrl,
        });
        this.toastr.success('Deal Added Successfully!');
      }
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to Save Deal!');
    } finally {
      this.formReset();
      this.isLoading = false;
    }
  }

  // Deletes a Deals item , first delete image, then deletes record
  async deleteDeals(id: string) {
    const confirmed = confirm('Are you sure you want to delete this Deal?');
    if (!confirmed) return;
    if (!id) return;

    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseService.getSingleDealsItem(id);

      if (error) throw error;

      // Delete the image from storage first using the image URL
      await this.supabaseService.deleteImage(data.image);

      // Delete the database record
      await this.supabaseService.deleteDeals(id);

      this.toastr.success('Deal Deleted Successfully!');
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to delete Deal!');
    } finally {
      this.isLoading = false;
    }
  }
}
