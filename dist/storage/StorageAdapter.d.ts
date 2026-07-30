export interface StorageAdapter {
    get(): string | null;
    set(value: string): void;
    clear(): void;
}
