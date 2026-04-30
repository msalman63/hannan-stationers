import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Stationery } from '../../interfaces/stationery';
import { Grocery } from '../../interfaces/grocery';
import { Sports } from '../../interfaces/sports';
import { Tobacco } from '../../interfaces/tobacco';
import { Deals } from '../../interfaces/deals';
import { CustomerInfo } from '../../interfaces/customer-info';
import { CartItem } from '../../interfaces/cart-item';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase!: SupabaseClient;
  private bucket = 'app-images'; // Storage bucket name in Supabase

  _session: AuthSession | null = null;
  currentUserId: string | null = null;
  private router = inject(Router);

  constructor() {
    // Initialize Supabase client with project URL and public anon key
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  //  Auth Functions

  // Signs in the user with email and password, then updates the session
  async signInWithEmail(email: string, password: string) {
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) throw authError;
    this._session = authData.session;
    await this.updateSession();
    return { authData, authError };
  }

  // Signs out the user and clears the local session and user ID
  async signOut() {
    this._session = null;
    this.currentUserId = null;
    return await this.supabase.auth.signOut();
  }

  //Update Session (Syncs currentUserId from the active session)
  async updateSession() {
    if (this._session) {
      this.currentUserId = this._session.user.id;
    } else {
      this.currentUserId = null;
    }
  }

  // Fetches the current session from Supabase and updates local state
  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    this._session = data.session;
    return this._session;
  }

  // Listens for auth state changes (sign-in, sign-out, token refresh) and keeps session in sync
  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      this._session = session;
      await this.updateSession();
      callback(event, session);
    });
  }

  //  Image Functions

  // Validates file type (png, jpg, jpeg) and size (max 2MB) before upload
  validateImage(file: File): boolean {
    if (!file) return false;
    const imageSize = 2 * 1024 * 1024;
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) return false;
    if (file.size > imageSize) return false;
    return true;
  }

  // Validates and uploads an image to the given folder, returns the public URL
  async uploadImage(file: File, folder: string): Promise<string> {
    try {
      if (!this.validateImage(file)) throw new Error('Invalid File');
      const filePath = `${folder}/${Date.now()}_${file.name}`;
      const { error } = await this.supabase.storage.from(this.bucket).upload(filePath, file);
      if (error) throw error;
      const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload Failed', error);
      throw error;
    }
  }

  // Deletes an image from storage using its public URL
  async deleteImage(path: string): Promise<void> {
    try {
      if (!path) return;
      // Extract relative path after 'app-images/' from the full public URL
      //like 'https://xyz.supabase.co/storage/v1/object/public/app-images/stationery/image.png' becomes 'stationery/image.png'
      path = path.split('app-images/')[1];
      const { error } = await this.supabase.storage.from(this.bucket).remove([path]);
      if (error) throw error;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  //Update / Replace (Deletes the old image and uploads a new one, returns the new public URL)
  async replaceImage(oldPath: string, file: File, folder: string): Promise<string> {
    try {
      if (oldPath) await this.deleteImage(oldPath);
      const newPath = await this.uploadImage(file, folder);
      return newPath;
    } catch (error) {
      console.error('Replace failed:', error);
      throw error;
    }
  }

  //  Stationery Table Functions

  // Fetches all stationery items ordered by newest first
  async getAllStationery() {
    const { data, error } = await this.supabase
      .from('stationery')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  // Getting a single stationery item by id
  async getSingleStationery(id: string) {
    const { data, error } = await this.supabase.from('stationery').select().eq('id', id).single();
    // Throws error if query fails, returns clean data object directly (no wrapper).
    if (error) throw error;
    return data;
  }

  // Inserts a new stationery item into the database
  async addStationery(stationery: Stationery) {
    const { data, error } = await this.supabase.from('stationery').insert([stationery]).select();
    return { data, error };
  }

  // Updates an existing stationery item by ID
  async updateStationery(id: string, stationery: Stationery) {
    const { data, error } = await this.supabase
      .from('stationery')
      .update(stationery)
      .eq('id', id)
      .select();
    return { data, error };
  }

  // Deletes a stationery item by ID
  async deleteStationery(id: string) {
    const { data, error } = await this.supabase.from('stationery').delete().eq('id', id).select();
    return { data, error };
  }

  //  Grocery Table Functions

  // Fetches all grocery items ordered by newest first
  async getAllGrocery() {
    const { data, error } = await this.supabase
      .from('grocery')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  // Getting a single grocery item by id
  async getSingleGroceryItem(id: string) {
    const { data, error } = await this.supabase.from('grocery').select().eq('id', id).single();
    // Throws error if query fails, returns clean data object directly (no wrapper).
    if (error) throw error;
    return data;
  }

  // Inserts a new grocery item into the database
  async addGrocery(grocery: Grocery) {
    const { data, error } = await this.supabase.from('grocery').insert([grocery]).select();
    return { data, error };
  }

  // Updates an existing grocery item by ID
  async updateGrocery(id: string, grocery: Grocery) {
    const { data, error } = await this.supabase
      .from('grocery')
      .update(grocery)
      .eq('id', id)
      .select();
    return { data, error };
  }

  // Deletes a grocery item by ID
  async deleteGrocery(id: string) {
    const { data, error } = await this.supabase.from('grocery').delete().eq('id', id).select();
    return { data, error };
  }

  //  Sports Table Functions

  // Fetches all sports items ordered by newest first
  async getAllSports() {
    const { data, error } = await this.supabase
      .from('sports')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  // Getting a single sports item by id
  async getSingleSportsItem(id: string) {
    const { data, error } = await this.supabase.from('sports').select().eq('id', id).single();
    // Throws error if query fails, returns clean data object directly (no wrapper).
    if (error) throw error;
    return data;
  }

  // Inserts a new sports item into the database
  async addSports(sports: Sports) {
    const { data, error } = await this.supabase.from('sports').insert([sports]).select();
    return { data, error };
  }

  // Updates an existing sports item by ID
  async updateSports(id: string, sports: Sports) {
    const { data, error } = await this.supabase.from('sports').update(sports).eq('id', id).select();
    return { data, error };
  }

  // Deletes a sports item by ID
  async deleteSports(id: string) {
    const { data, error } = await this.supabase.from('sports').delete().eq('id', id).select();
    return { data, error };
  }

  //  Tobacco Table Functions

  // Fetches all Tobacco items ordered by newest first
  async getAllTobacco() {
    const { data, error } = await this.supabase
      .from('tobacco')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  // Getting a single Tobacco item by id
  async getSingleTobaccoItem(id: string) {
    const { data, error } = await this.supabase.from('tobacco').select().eq('id', id).single();
    // Throws error if query fails, returns clean data object directly (no wrapper).
    if (error) throw error;
    return data;
  }

  // Inserts a new Tobacco item into the database
  async addTobacco(tobacco: Tobacco) {
    const { data, error } = await this.supabase.from('tobacco').insert([tobacco]).select();
    return { data, error };
  }

  // Updates an existing Tobacco item by ID
  async updateTobacco(id: string, tobacco: Tobacco) {
    const { data, error } = await this.supabase
      .from('tobacco')
      .update(tobacco)
      .eq('id', id)
      .select();
    return { data, error };
  }

  // Deletes a tobacco item by ID
  async deleteTobacco(id: string) {
    const { data, error } = await this.supabase.from('tobacco').delete().eq('id', id).select();
    return { data, error };
  }

  //  Deals Table Functions

  // Fetches all deals items ordered by newest first
  async getAllDeals() {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  // Getting a single Deals item by id
  async getSingleDealsItem(id: string) {
    const { data, error } = await this.supabase.from('deals').select().eq('id', id).single();
    // Throws error if query fails, returns clean data object directly (no wrapper).
    if (error) throw error;
    return data;
  }

  // Inserts a new Deals item into the database
  async addDeals(deal: Deals) {
    const { data, error } = await this.supabase.from('deals').insert([deal]).select();
    return { data, error };
  }

  // Updates an existing Deals item by ID
  async updateDeals(id: string, deal: Deals) {
    const { data, error } = await this.supabase.from('deals').update(deal).eq('id', id).select();
    return { data, error };
  }

  // Deletes a Deals item by ID
  async deleteDeals(id: string) {
    const { data, error } = await this.supabase.from('deals').delete().eq('id', id).select();
    return { data, error };
  }

  //  settings Table Functions

  // Fetches all settings items ordered by newest first
  async getSettings() {
    const { data, error } = await this.supabase.from('settings').select('*').maybeSingle();

    return { data, error };
  }

  // Update settings
  async updateSettings(update: any, id: string) {
    const { error } = await this.supabase.from('settings').update(update).eq('id', id);
    return { error };
  }

  //Get all Orders
  async getAllOrders() {
    //'*, order_items(*)' This returns each order WITH its items nested inside
    const { data, error } = await this.supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  //Update the Order Status
  async updateOrderStatus(order_id: string, status: 'pending' | 'confirmed' | 'delivered') {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status })
      .eq('id', order_id)
      .select();
    return { data, error };
  }
  //Save Order Function to add the customer,order,product data
  async saveOrder(
    customerData: CustomerInfo,
    cartItems: CartItem[],
    shipping: number,
    total: number,
  ) {
    const { data: order_data, error: order_error } = await this.supabase
      .from('orders')
      .insert([{ ...customerData, shipping: shipping, total: total }])
      .select()
      .single();
    if (order_error) throw order_error;

    const orderItems = cartItems.map((item) => ({
      order_id: order_data.id,
      product_id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
    }));
    const { data: orderItem_data, error: orderItem_error } = await this.supabase
      .from('order_items')
      .insert(orderItems)
      .select();
    if (orderItem_error) throw orderItem_error;
    return { order_data, orderItem_data };
  }
}
