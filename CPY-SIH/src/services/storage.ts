// Offline-first storage service
export class StorageService {
  private dbName = 'FarmAI';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('farmers')) {
          db.createObjectStore('farmers', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('soilData')) {
          const soilStore = db.createObjectStore('soilData', { keyPath: 'id' });
          soilStore.createIndex('farmerId', 'farmerId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('predictions')) {
          const predictionStore = db.createObjectStore('predictions', { keyPath: 'id' });
          predictionStore.createIndex('farmerId', 'farmerId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('sensorData')) {
          const sensorStore = db.createObjectStore('sensorData', { keyPath: 'id' });
          sensorStore.createIndex('farmerId', 'farmerId', { unique: false });
        }
      };
    });
  }

  async store(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(storeName: string, id: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getByIndex(storeName: string, indexName: string, value: string): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Sync status tracking
  async setSyncStatus(key: string, synced: boolean): Promise<void> {
    localStorage.setItem(`sync_${key}`, synced.toString());
  }

  getSyncStatus(key: string): boolean {
    return localStorage.getItem(`sync_${key}`) === 'true';
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}

export const storageService = new StorageService();