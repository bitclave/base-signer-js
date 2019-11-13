class LruEntity<K, V> {

    public readonly key: K;
    public readonly value: V;
    public readonly expireTimeStamp: number;
    public readonly createdAt: number;

    private readonly expirationCallback: (entity: LruEntity<K, V>) => void;
    private readonly timer: any;

    constructor(key: K, data: V, expireTimeStamp: number, expirationCallback: (entity: LruEntity<K, V>) => void) {
        this.key = key;
        this.value = data;
        this.expireTimeStamp = expireTimeStamp;
        this.expirationCallback = expirationCallback;
        this.createdAt = new Date().getTime();

        const disposeTime = this.expireTimeStamp - this.createdAt;

        if (disposeTime <= 0) {
            throw new Error('expire time should be great then current time');
        }

        this.timer = setTimeout(() => this.dispose(), disposeTime);
    }

    public dispose() {
        clearTimeout(this.timer);
        this.expirationCallback(this);
    }
}

export class LruMap<K, V> {

    private readonly lruEntities: Map<K, LruEntity<K, V>> = new Map<K, LruEntity<K, V>>();

    constructor(private readonly maxItems?: number) {

    }

    public get(key: K): V | undefined {
        const entity = this.lruEntities.get(key);

        return entity ? entity.value : undefined;
    }

    public set(key: K, value: V, expireTimeStamp: number) {
        const newEntity = new LruEntity(key, value, expireTimeStamp, (entity) => this.onDisposeEntity(entity));
        const oldEntity = this.lruEntities.get(key);

        if (oldEntity) {
            oldEntity.dispose();
        }

        this.lruEntities.set(key, newEntity);

        if ((this.maxItems && this.maxItems > 0) && this.lruEntities.size > this.maxItems) {
            this.removeOldest();
        }
    }

    public delete(key: K): boolean {
        const entity = this.lruEntities.get(key);

        if (entity) {
            entity.dispose();
        }

        return !!entity;
    }

    private onDisposeEntity(entity: LruEntity<K, V>) {
        this.lruEntities.delete(entity.key);
    }

    private removeOldest() {
        let selected: LruEntity<K, V> | undefined;

        for (const item of this.lruEntities.values()) {
            const createdAt = selected ? selected.createdAt : new Date().getTime();

            if (item.createdAt < createdAt) {
                selected = item;
            }
        }

        if (selected) {
            selected.dispose();
        }
    }
}
