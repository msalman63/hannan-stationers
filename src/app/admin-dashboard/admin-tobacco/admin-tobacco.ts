import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Tobacco } from '../../interfaces/tobacco';
import { SupabaseService } from '../../shared/services/supabase-service';
import { ToastrService } from 'ngx-toastr';
import { Modal } from '../../shared/components/modal/modal';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-admin-tobacco',
  imports: [CommonModule , ReactiveFormsModule, Modal , Spinner],
  templateUrl: './admin-tobacco.html',
  styleUrl: './admin-tobacco.css',
})
export class AdminTobacco {
  tobaccoForm!: FormGroup;
  tobaccoItems = signal<Tobacco[]>([]);
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  isPageLoading : boolean = true;

  selectedFile: File | null = null;
  previewUrl: string | null = null; // Local preview URL before upload
  imagePreview = signal<string[]>([]);
  private supabaseService = inject(SupabaseService);
  private toastr = inject(ToastrService);

  isEditMode: boolean = false;
  editTobaccoId: string | null = null;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.formReset();
  }

  async ngOnInit() {
    await this.getTobaccoItems();
    this.isPageLoading = false;
  }

  // Load Tobacco Items
  private async getTobaccoItems() {
    const { data, error } = await this.supabaseService.getAllTobacco();
    if (error) return;
    this.tobaccoItems.set(data ?? []);
  }

  constructor(private fb: FormBuilder) {
    // Initialize the form with required validators
    this.tobaccoForm = this.fb.group({
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
      this.tobaccoForm.patchValue({ image: this.previewUrl });
      this.tobaccoForm.get('image')?.updateValueAndValidity();
    }
  }

  //Function for clearing one image...
  removeImage(index: number) {
    // Remove from preview signal
    this.imagePreview.update((prev) => prev.filter((_, i) => i !== index));
    // mark image as empty again so button disables
    this.tobaccoForm.patchValue({ image: '' });
    this.tobaccoForm.get('image')?.updateValueAndValidity();
  }

  // Prepare form for editing and populate form
  startUpdate(tobacco: Tobacco) {
    if (!tobacco.id) return;
    this.isEditMode = true;
    this.isModalOpen = true;
    this.editTobaccoId = tobacco.id;

    this.tobaccoForm.patchValue({
      name: tobacco.name,
      description: tobacco.description,
      price: tobacco.price,
      image: tobacco.image,
    });
    //set the image to show image on preview...
    this.imagePreview.set([tobacco.image]);
  }

  // Resets the form
  formReset() {
    this.tobaccoForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.isEditMode = false;
    this.isModalOpen = false;
    this.editTobaccoId = null;
    this.imagePreview.set([]);
  }

  async onSubmit() {
    // Stop if form is invalid
    if (this.tobaccoForm.invalid) {
      this.tobaccoForm.markAllAsTouched();
      return;
    }

    // In add mode, a file must be selected
    if (!this.isEditMode && !this.selectedFile) return;

    this.isLoading = true;

    try {
      // Grocery object from form values
      const tobaccoData: Tobacco = {
        name: this.tobaccoForm.value.name,
        description: this.tobaccoForm.value.description,
        price: this.tobaccoForm.value.price,
        image: this.tobaccoForm.value.image, // Holds existing URL in edit mode
      };

      if (this.isEditMode && this.editTobaccoId) {
        if (this.selectedFile) {
          // User selected a new image , replace old image in storage and get new URL
          const newImageUrl = await this.supabaseService.replaceImage(
            tobaccoData.image,
            this.selectedFile,
            'tobacco',
          );
          await this.supabaseService.updateTobacco(this.editTobaccoId, {
            ...tobaccoData,
            image: newImageUrl,
          });
        } else {
          // No new image selected , update record with existing image URL
          await this.supabaseService.updateTobacco(this.editTobaccoId, tobaccoData);
        }
        this.toastr.success('Tobacco Updated Successfully!');
      } else {
        // Add mode , upload image first, then save new record with returned URL
        const imageUrl = await this.supabaseService.uploadImage(this.selectedFile!, 'tobacco');
        await this.supabaseService.addTobacco({
          ...tobaccoData,
          image: imageUrl,
        });
        this.toastr.success('Tobacco Added Successfully!');
      }
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to Save Tobacco!');
    } finally {
      this.formReset();
      this.isLoading = false;
    }
  }

  // Deletes a tobacco item , first delete image, then deletes record
  async deleteTobacco(id: string) {
    const confirmed = confirm('Are you sure you want to delete this Tobacco?');
    if (!confirmed) return;
    if (!id) return;

    this.isLoading = true;

    try {
      const { data, error } = await this.supabaseService.getSingleTobaccoItem(id);

      if (error) throw error;

      // Delete the image from storage first using the image URL
      await this.supabaseService.deleteImage(data.image);

      // Delete the database record
      await this.supabaseService.deleteTobacco(id);

      this.toastr.success('Tobacco Deleted Successfully!');
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to delete Tobacco!');
    } finally {
      this.isLoading = false;
    }
  }
}
