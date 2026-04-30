import { Component, inject, signal } from '@angular/core';
import { Sports } from '../../interfaces/sports';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../shared/services/supabase-service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Modal } from '../../shared/components/modal/modal';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-admin-sports',
  imports: [CommonModule, ReactiveFormsModule, Modal , Spinner],
  templateUrl: './admin-sports.html',
  styleUrl: './admin-sports.css',
})
export class AdminSports {
  sportsForm!: FormGroup;
  sportsItems = signal<Sports[]>([]);
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  isPageLoading : boolean = true;

  selectedFile: File | null = null;
  previewUrl: string | null = null; // Local preview URL before upload
  imagePreview = signal<string[]>([]);
  private supabaseService = inject(SupabaseService);
  private toastr = inject(ToastrService);

  isEditMode: boolean = false;
  editSportsId: string | null = null;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.formReset();
  }

  async ngOnInit() {
    await this.getSports();
    this.isPageLoading = false;
  }

  // Load Grocery Items
  private async getSports() {
    const { data, error } = await this.supabaseService.getAllSports();
    if (error) return;
    this.sportsItems.set(data ?? []);
  }

  constructor(private fb: FormBuilder) {
    // Initialize the form with required validators
    this.sportsForm = this.fb.group({
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
      this.sportsForm.patchValue({ image: this.previewUrl });
      this.sportsForm.get('image')?.updateValueAndValidity();
    }
  }

  //Function for clearing one image...
  removeImage(index: number) {
    // Remove from preview signal
    this.imagePreview.update((prev) => prev.filter((_, i) => i !== index));
    // mark image as empty again so button disables
    this.sportsForm.patchValue({ image: '' });
    this.sportsForm.get('image')?.updateValueAndValidity();
  }

  // Prepare form for editing and populate form
  startUpdate(sports: Sports) {
    if (!sports.id) return;
    this.isEditMode = true;
    this.isModalOpen = true;
    this.editSportsId = sports.id;

    this.sportsForm.patchValue({
      name: sports.name,
      description: sports.description,
      price: sports.price,
      image: sports.image,
    });
    //set the image to show image on preview...
    this.imagePreview.set([sports.image]);
  }

  // Resets the form
  formReset() {
    this.sportsForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.isEditMode = false;
    this.isModalOpen = false;
    this.editSportsId = null;
    this.imagePreview.set([]);
  }

  async onSubmit() {
    // Stop if form is invalid
    if (this.sportsForm.invalid) {
      this.sportsForm.markAllAsTouched();
      return;
    }

    // In add mode, a file must be selected
    if (!this.isEditMode && !this.selectedFile) return;

    this.isLoading = true;

    try {
      // Grocery object from form values
      const sportsData: Sports = {
        name: this.sportsForm.value.name,
        description: this.sportsForm.value.description,
        price: this.sportsForm.value.price,
        image: this.sportsForm.value.image, // Holds existing URL in edit mode
      };

      if (this.isEditMode && this.editSportsId) {
        if (this.selectedFile) {
          // User selected a new image , replace old image in storage and get new URL
          const newImageUrl = await this.supabaseService.replaceImage(
            sportsData.image,
            this.selectedFile,
            'sports',
          );
          await this.supabaseService.updateSports(this.editSportsId, {
            ...sportsData,
            image: newImageUrl,
          });
        } else {
          // No new image selected , update record with existing image URL
          await this.supabaseService.updateSports(this.editSportsId, sportsData);
        }
        this.toastr.success('Sports Updated Successfully!');
      } else {
        // Add mode , upload image first, then save new record with returned URL
        const imageUrl = await this.supabaseService.uploadImage(this.selectedFile!, 'sports');
        await this.supabaseService.addSports({
          ...sportsData,
          image: imageUrl,
        });
        this.toastr.success('Sports Added Successfully!');
      }
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to Save Sports!');
    } finally {
      this.formReset();
      this.isLoading = false;
    }
  }

  // Deletes a Sports item , first delete image, then deletes record
  async deleteSports(id: string) {
    const confirmed = confirm('Are you sure you want to delete this Sports?');
    if (!confirmed) return;
    if (!id) return;

    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseService.getSingleSportsItem(id);

      if (error) throw error;

      // Delete the image from storage first using the image URL
      await this.supabaseService.deleteImage(data.image);

      // Delete the database record
      await this.supabaseService.deleteSports(id);

      this.toastr.success('Sports Deleted Successfully!');
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to delete Sports!');
    } finally {
      this.isLoading = false;
    }
  }
}
