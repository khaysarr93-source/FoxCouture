/**
 * Service de Synchronisation Supabase & Cache Local (Offline-First)
 * Foxe'Couture — Conforme CDC Section 2, 3 & 4
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { Client, Commande, FicheMesure } from '../types';

export interface SyncResult<T> {
  success: boolean;
  data?: T;
  source: 'cloud' | 'local';
  error?: string;
}

/**
 * Récupère les clients depuis Supabase si configuré, ou renvoie null pour utiliser le stockage local
 */
export async function fetchClientsCloud(orgId: string): Promise<SyncResult<Client[]>> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, source: 'local' };
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Sync] Erreur lecture clients Supabase:', error.message);
      return { success: false, source: 'local', error: error.message };
    }

    if (!data) return { success: true, source: 'cloud', data: [] };

    // Mapper les champs SQL vers l'interface Client FoxCouture
    const clients: Client[] = data.map((row: any) => ({
      id: row.id,
      nom: row.full_name?.split(' ').slice(1).join(' ') || row.nom || '',
      prenom: row.full_name?.split(' ')[0] || row.prenom || '',
      telephone: row.phone || row.telephone || '',
      email: row.email || '',
      adresse: row.address || row.adresse || '',
      avatarColor: '#D97706',
      dateCreation: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      preferences: {
        stylesFavoris: row.preferences?.stylesFavoris || ['Grand Boubou', 'Kaftan'],
        tissusPreferes: row.preferences?.tissusPreferes || ['Bazin Riche', 'Soie'],
        remarquesParticulieres: row.notes || row.preferences?.remarquesParticulieres || ''
      }
    }));

    return { success: true, source: 'cloud', data: clients };
  } catch (err: any) {
    console.warn('[Sync] Exception lors de la synchronisation Supabase:', err);
    return { success: false, source: 'local', error: err?.message || 'Erreur inconnue' };
  }
}

/**
 * Sauvegarde ou met à jour un client dans Supabase
 */
export async function upsertClientCloud(orgId: string, client: Client): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('clients')
      .upsert({
        id: client.id.includes('-') && client.id.length >= 32 ? client.id : undefined,
        org_id: orgId,
        full_name: `${client.prenom || ''} ${client.nom}`.trim(),
        phone: client.telephone,
        email: client.email || null,
        address: client.adresse || null,
        notes: client.preferences?.remarquesParticulieres || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('[Sync] Erreur sauvegarde client Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Sync] Exception sauvegarde client:', err);
    return false;
  }
}

/**
 * Sauvegarde une commande dans Supabase
 */
export async function upsertOrderCloud(orgId: string, commande: Commande): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('orders')
      .upsert({
        id: commande.id.includes('-') && commande.id.length >= 32 ? commande.id : undefined,
        org_id: orgId,
        reference: commande.reference,
        client_id: commande.clientId,
        status: commande.statut,
        delivery_date: commande.delaiLivraison || null,
        total_amount: commande.montantTotal,
        deposit_amount: commande.acompteVerse,
        balance_due: commande.soldeDu,
        notes: commande.remarquesProduction || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('[Sync] Erreur sauvegarde commande Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Sync] Exception sauvegarde commande:', err);
    return false;
  }
}

/**
 * Teste la connectivité avec l'instance Supabase
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: "Supabase n'est pas encore configuré (.env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY requis). Mode hors-ligne/démo actif."
    };
  }

  try {
    const { error } = await supabase.from('organizations').select('count', { count: 'exact', head: true });
    if (error) {
      return { connected: false, message: `Connexion Supabase refusée: ${error.message}` };
    }
    return { connected: true, message: 'Connexion Supabase active et fonctionnelle.' };
  } catch (e: any) {
    return { connected: false, message: `Erreur réseau: ${e.message}` };
  }
}
