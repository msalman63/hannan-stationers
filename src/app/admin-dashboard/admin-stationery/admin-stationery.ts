import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Stationery } from '../../interfaces/stationery';
import { SupabaseService } from '../../shared/services/supabase-service';
import { ToastrService } from 'ngx-toastr';
import { Modal } from '../../shared/components/modal/modal';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-admin-stationery',
  imports: [CommonModule, ReactiveFormsModule, Modal, Spinner],
  templateUrl: './admin-stationery.html',
  styleUrl: './admin-stationery.css',
})
export class AdminStationery {
  stationeryForm!: FormGroup;
  stationeryItems = signal<Stationery[]>([]);
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  isPageLoading : boolean = true;

  selectedFile: File | null = null;
  previewUrl: string | null = null; // Local preview URL before upload
  imagePreview = signal<string[]>([]);
  private supabaseService = inject(SupabaseService);
  private toastr = inject(ToastrService);

  isEditMode: boolean = false;
  editStationeryId: string | null = null;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.formReset();
  }

  async ngOnInit() {
    await this.getStationery();
    this.isPageLoading = false;
  }

  // Load Stationery Items
  private async getStationery() {
    const { data, error } = await this.supabaseService.getAllStationery();
    if (error) return;
    this.stationeryItems.set(data ?? []);
  }

  constructor(private fb: FormBuilder) {
    // Initialize the form with required validators
    this.stationeryForm = this.fb.group({
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
      this.stationeryForm.patchValue({ image: this.previewUrl });
      this.stationeryForm.get('image')?.updateValueAndValidity();
    }
  }

  //Function for clearing one image...
  removeImage(index: number) {
    // Remove from preview signal
    this.imagePreview.update((prev) => prev.filter((_, i) => i !== index));
    // mark image as empty again so button disables
    this.stationeryForm.patchValue({ image: '' });
    this.stationeryForm.get('image')?.updateValueAndValidity();
  }

  // Prepare form for editing and populate form
  startUpdate(stationery: Stationery) {
    if (!stationery.id) return;
    this.isEditMode = true;
    this.isModalOpen = true;
    this.editStationeryId = stationery.id;

    this.stationeryForm.patchValue({
      name: stationery.name,
      description: stationery.description,
      price: stationery.price,
      image: stationery.image,
    });
    //set the image to show image on preview...
    this.imagePreview.set([stationery.image]);
  }

  // Resets the form
  formReset() {
    this.stationeryForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.isEditMode = false;
    this.isModalOpen = false;
    this.editStationeryId = null;
    this.imagePreview.set([]);
  }

  async onSubmit() {
    // Stop if form is invalid
    if (this.stationeryForm.invalid) {
      this.stationeryForm.markAllAsTouched();
      return;
    }

    // In add mode, a file must be selected
    if (!this.isEditMode && !this.selectedFile) return;

    this.isLoading = true;

    try {
      // Stationery object from form values
      const stationeryData: Stationery = {
        name: this.stationeryForm.value.name,
        description: this.stationeryForm.value.description,
        price: this.stationeryForm.value.price,
        image: this.stationeryForm.value.image, // Holds existing URL in edit mode
      };

      if (this.isEditMode && this.editStationeryId) {
        if (this.selectedFile) {
          // User selected a new image , replace old image in storage and get new URL
          const newImageUrl = await this.supabaseService.replaceImage(
            stationeryData.image,
            this.selectedFile,
            'stationery',
          );
          await this.supabaseService.updateStationery(this.editStationeryId, {
            ...stationeryData,
            image: newImageUrl,
          });
        } else {
          // No new image selected , update record with existing image URL
          await this.supabaseService.updateStationery(this.editStationeryId, stationeryData);
        }
        this.toastr.success('Stationery Updated Successfully!');
      } else {
        // Add mode , upload image first, then save new record with returned URL
        const imageUrl = await this.supabaseService.uploadImage(this.selectedFile!, 'stationery');
        await this.supabaseService.addStationery({
          ...stationeryData,
          image: imageUrl,
        });
        this.toastr.success('Stationery Added Successfully!');
      }
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to Save Stationery!');
    } finally {
      this.formReset();
      this.isLoading = false;
    }
  }

  // Deletes a stationery item , first delete image, then deletes record
  async deleteStationery(id: string) {
    const confirmed = confirm('Are you sure you want to delete this stationery?');
    if (!confirmed) return;
    if (!id) return;

    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseService.getSingleStationery(id);

      if (error) throw error;

      // Delete the image from storage first using the image URL
      await this.supabaseService.deleteImage(data.image);

      // Delete the database record
      await this.supabaseService.deleteStationery(id);

      this.toastr.success('Stationery Deleted Successfully!');
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to delete Stationery!');
    } finally {
      this.isLoading = false;
    }
  }
}
